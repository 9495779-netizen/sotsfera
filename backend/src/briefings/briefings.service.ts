import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { addDays } from 'date-fns';
import { BriefingRecord, BriefingStatus } from './briefing-record.entity';
import { BriefingJournal } from './briefing-journal.entity';
import { BriefingType } from './briefing-type.entity';
import { CreateBriefingRecordDto } from './dto/briefing.dto';

export interface BriefingFilter {
  typeId?: string;
  deptId?: string;
  status?: BriefingStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class BriefingsService {
  constructor(
    @InjectRepository(BriefingRecord)
    private readonly recordRepo: Repository<BriefingRecord>,
    @InjectRepository(BriefingJournal)
    private readonly journalRepo: Repository<BriefingJournal>,
    @InjectRepository(BriefingType)
    private readonly typeRepo: Repository<BriefingType>,
  ) {}

  async findAllRecords(orgId: string, filter: BriefingFilter) {
    const { typeId, status, from, to, page = 1, limit = 20 } = filter;

    const qb = this.recordRepo
      .createQueryBuilder('br')
      .leftJoinAndMapOne('br.type', 'briefing_types', 'bt', 'bt.id = br.type_id')
      .where('br.org_id = :orgId', { orgId });

    if (typeId) qb.andWhere('br.type_id = :typeId', { typeId });
    if (status) qb.andWhere('br.status = :status', { status });
    if (from) qb.andWhere('br.conducted_at >= :from', { from });
    if (to) qb.andWhere('br.conducted_at <= :to', { to });

    const [items, total] = await qb
      .orderBy('br.next_due_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async conductBriefing(orgId: string, dto: CreateBriefingRecordDto): Promise<BriefingRecord> {
    const type = await this.typeRepo.findOne({ where: { id: dto.typeId } });
    if (!type) throw new NotFoundException('Тип инструктажа не найден');

    const nextDueAt = type.periodDays
      ? addDays(new Date(dto.conductedAt), type.periodDays)
      : undefined;

    const record = this.recordRepo.create({
      ...dto,
      orgId,
      status: BriefingStatus.COMPLETED,
      nextDueAt,
    });

    return this.recordRepo.save(record);
  }

  async bulkConduct(orgId: string, employeeIds: string[], dto: Omit<CreateBriefingRecordDto, 'employeeId'>) {
    const results = await Promise.allSettled(
      employeeIds.map((employeeId) =>
        this.conductBriefing(orgId, { ...dto, employeeId }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    return { succeeded, failed };
  }

  async findOverdue(orgId: string): Promise<BriefingRecord[]> {
    return this.recordRepo.find({
      where: {
        orgId,
        status: BriefingStatus.PLANNED,
        nextDueAt: LessThan(new Date()),
      },
    });
  }

  async findUpcoming(orgId: string, daysAhead = 30): Promise<BriefingRecord[]> {
    return this.recordRepo.find({
      where: {
        orgId,
        status: BriefingStatus.PLANNED,
        nextDueAt: Between(new Date(), addDays(new Date(), daysAhead)),
      },
      order: { nextDueAt: 'ASC' },
    });
  }

  async markOverdue(orgId?: string): Promise<number> {
    const qb = this.recordRepo
      .createQueryBuilder()
      .update(BriefingRecord)
      .set({ status: BriefingStatus.OVERDUE })
      .where('status = :status', { status: BriefingStatus.PLANNED })
      .andWhere('next_due_at < :now', { now: new Date() });

    if (orgId) qb.andWhere('org_id = :orgId', { orgId });

    const result = await qb.execute();
    return result.affected || 0;
  }

  async createJournal(orgId: string, dto: any): Promise<BriefingJournal> {
    const journal = this.journalRepo.create({ ...dto, orgId });
    return this.journalRepo.save(journal);
  }

  async findJournals(orgId: string) {
    return this.journalRepo.find({
      where: { orgId },
      order: { createdAt: 'DESC' },
    });
  }
}
