import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BriefingJournal, JournalType } from '../briefings/briefing-journal.entity';
import { BriefingRecord } from '../briefings/briefing-record.entity';
import { MedDirection } from '../medical/med-direction.entity';
import { KnowledgeProtocol } from '../training/knowledge-protocol.entity';
import { Order } from '../orders/order.entity';
import { Document } from '../documents/document.entity';
import { Employee } from '../employees/employee.entity';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly templatesDir: string;

  constructor(
    @InjectRepository(BriefingJournal)
    private readonly journalRepo: Repository<BriefingJournal>,
    @InjectRepository(BriefingRecord)
    private readonly briefingRecordRepo: Repository<BriefingRecord>,
    @InjectRepository(MedDirection)
    private readonly medDirectionRepo: Repository<MedDirection>,
    @InjectRepository(KnowledgeProtocol)
    private readonly protocolRepo: Repository<KnowledgeProtocol>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    private readonly config: ConfigService,
  ) {
    this.s3 = new S3Client({
      endpoint: config.get<string>('s3.endpoint'),
      region: config.get<string>('s3.region'),
      credentials: {
        accessKeyId: config.get<string>('s3.accessKey')!,
        secretAccessKey: config.get<string>('s3.secretKey')!,
      },
      forcePathStyle: true,
    });
    this.bucket = config.get<string>('s3.bucket')!;
    this.templatesDir = path.join(__dirname, 'templates');

    // Handlebars helper для eq
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    Handlebars.registerHelper('index_plus_1', (index: number) => index + 1);
  }

  async generateBriefingJournal(journalId: string): Promise<string> {
    const journal = await this.journalRepo.findOne({ where: { id: journalId } });
    if (!journal) throw new NotFoundException('Журнал не найден');

    const records = await this.briefingRecordRepo
      .createQueryBuilder('br')
      .leftJoinAndSelect('br.employee', 'e')
      .where('br.org_id = :orgId', { orgId: journal.orgId })
      .andWhere('br.conducted_at BETWEEN :start AND :end', {
        start: journal.periodStart,
        end: journal.periodEnd,
      })
      .getMany();

    const org = await this.orgRepo.findOne({ where: { id: journal.orgId } });

    const templateName =
      journal.journalType === JournalType.INDUCTION
        ? 'briefing-journal-induction.hbs'
        : 'briefing-journal-workplace.hbs';

    const context = {
      orgName: org?.name || '',
      inn: org?.inn || '',
      periodStart: this.formatDate(journal.periodStart),
      periodEnd: this.formatDate(journal.periodEnd),
      records: records.map((r, i) => ({
        rowIndex: i + 1,
        conductedAt: this.formatDate(r.conductedAt),
        employeeName: '',
        birthYear: '',
        position: '',
        department: '',
        instructorName: '',
        instructorPosition: '',
        briefingType: '',
      })),
    };

    const fileKey = `documents/${journal.orgId}/journal_${journalId}.pdf`;
    const fileUrl = await this.renderAndUpload(templateName, context, fileKey);

    await this.journalRepo.update(journalId, { fileUrl });

    await this.documentRepo.save(
      this.documentRepo.create({
        orgId: journal.orgId,
        docType: 'briefing_journal',
        refId: journalId,
        refType: 'BriefingJournal',
        title: `Журнал инструктажей ${this.formatDate(journal.periodStart)} — ${this.formatDate(journal.periodEnd)}`,
        fileUrl,
      }),
    );

    return this.getPresignedUrl(fileKey);
  }

  async generateMedDirection(directionId: string): Promise<string> {
    const direction = await this.medDirectionRepo.findOne({ where: { id: directionId } });
    if (!direction) throw new NotFoundException('Направление не найдено');

    const employee = await this.employeeRepo.findOne({ where: { id: direction.employeeId } });
    const org = await this.orgRepo.findOne({ where: { id: direction.orgId } });

    const context = {
      orgName: org?.name || '',
      inn: org?.inn || '',
      okved: '',
      medicalOrg: direction.medicalOrg || '',
      examType: 'периодический',
      employeeName: employee
        ? `${employee.lastName} ${employee.firstName} ${employee.middleName || ''}`
        : '',
      birthDate: employee?.birthDate ? this.formatDate(employee.birthDate) : '',
      gender: '',
      deptName: '',
      position: '',
      harmfulFactors: direction.harmfulFactors,
      createdAt: this.formatDate(direction.createdAt),
      directorName: '',
      directorPosition: 'Руководитель',
    };

    const fileKey = `documents/${direction.orgId}/med_direction_${directionId}.pdf`;
    const fileUrl = await this.renderAndUpload('med-direction.hbs', context, fileKey);

    await this.medDirectionRepo.update(directionId, { fileUrl });
    return this.getPresignedUrl(fileKey);
  }

  async generateKnowledgeProtocol(protocolId: string): Promise<string> {
    const protocol = await this.protocolRepo.findOne({ where: { id: protocolId } });
    if (!protocol) throw new NotFoundException('Протокол не найден');

    const context = {
      protocolNumber: protocolId.slice(-6).toUpperCase(),
      date: this.formatDate(protocol.date),
      orgName: '',
      commissionMembers: protocol.commissionMembers,
      examinees: [],
    };

    const fileKey = `documents/${protocol.orgId}/protocol_${protocolId}.pdf`;
    const fileUrl = await this.renderAndUpload('knowledge-protocol.hbs', context, fileKey);

    await this.protocolRepo.update(protocolId, { fileUrl });
    return this.getPresignedUrl(fileKey);
  }

  async generateOrder(orderId: string): Promise<string> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Приказ не найден');

    const org = await this.orgRepo.findOne({ where: { id: order.orgId } });

    const context = {
      orgName: org?.name || '',
      logoUrl: org?.logoUrl || '',
      orderNumber: order.number,
      orderDate: this.formatDate(order.date),
      content: order.content?.body || '',
      basis: order.content?.basis || '',
      directorName: order.content?.directorName || '',
      directorPosition: order.content?.directorPosition || 'Директор',
      signDate: order.signedAt ? this.formatDate(order.signedAt) : '_________',
    };

    const fileKey = `documents/${order.orgId}/order_${orderId}.pdf`;
    const fileUrl = await this.renderAndUpload('order.hbs', context, fileKey);

    await this.orderRepo.update(orderId, { fileUrl });
    return this.getPresignedUrl(fileKey);
  }

  private async renderAndUpload(
    templateFile: string,
    context: Record<string, unknown>,
    s3Key: string,
  ): Promise<string> {
    const html = this.renderTemplate(templateFile, context);
    const pdfBuffer = await this.htmlToPdf(html);
    return this.uploadToS3(s3Key, pdfBuffer);
  }

  private renderTemplate(templateFile: string, context: Record<string, unknown>): string {
    const tplPath = path.join(this.templatesDir, templateFile);
    const source = fs.readFileSync(tplPath, 'utf8');
    const template = Handlebars.compile(source);
    return template(context);
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
      });
      return Buffer.from(pdf);
    } finally {
      if (browser) await browser.close();
    }
  }

  private async uploadToS3(key: string, body: Buffer): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: 'application/pdf',
      }),
    );
    return `s3://${this.bucket}/${key}`;
  }

  private async getPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: 86400 });
  }

  private formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return format(new Date(date), 'dd.MM.yyyy', { locale: ru });
  }
}
