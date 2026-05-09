import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingProgram } from './training-program.entity';
import { TrainingRecord } from './training-record.entity';
import { KnowledgeProtocol } from './knowledge-protocol.entity';
import { Test } from './test.entity';
import { TestResult } from './test-result.entity';
import { addMonths } from 'date-fns';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingProgram) private readonly programRepo: Repository<TrainingProgram>,
    @InjectRepository(TrainingRecord) private readonly recordRepo: Repository<TrainingRecord>,
    @InjectRepository(KnowledgeProtocol) private readonly protocolRepo: Repository<KnowledgeProtocol>,
    @InjectRepository(Test) private readonly testRepo: Repository<Test>,
    @InjectRepository(TestResult) private readonly resultRepo: Repository<TestResult>,
  ) {}

  // --- Программы ---
  async findPrograms(orgId: string) {
    return this.programRepo.find({ where: { orgId }, order: { name: 'ASC' } });
  }

  async createProgram(orgId: string, dto: Partial<TrainingProgram>): Promise<TrainingProgram> {
    return this.programRepo.save(this.programRepo.create({ ...dto, orgId }));
  }

  // --- Записи об обучении ---
  async findRecords(orgId: string, page = 1, limit = 20) {
    const [items, total] = await this.recordRepo.findAndCount({
      where: { orgId },
      order: { nextDueAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async createRecord(orgId: string, dto: Partial<TrainingRecord>): Promise<TrainingRecord> {
    const program = dto.programId
      ? await this.programRepo.findOne({ where: { id: dto.programId } })
      : null;

    const nextDueAt =
      program?.validityMonths && dto.endDate
        ? addMonths(new Date(dto.endDate), program.validityMonths)
        : undefined;

    return this.recordRepo.save(
      this.recordRepo.create({ ...dto, orgId, nextDueAt }),
    );
  }

  // --- Протоколы ---
  async findProtocols(orgId: string) {
    return this.protocolRepo.find({ where: { orgId }, order: { date: 'DESC' } });
  }

  async createProtocol(orgId: string, dto: Partial<KnowledgeProtocol>): Promise<KnowledgeProtocol> {
    return this.protocolRepo.save(this.protocolRepo.create({ ...dto, orgId }));
  }

  // --- Тесты ---
  async findTest(orgId: string, testId: string): Promise<Test> {
    const test = await this.testRepo.findOne({ where: { id: testId, orgId } });
    if (!test) throw new NotFoundException('Тест не найден');
    // Не возвращаем правильные ответы клиенту
    return {
      ...test,
      questions: test.questions.map(({ correctOptionId: _, ...q }) => q as any),
    };
  }

  async createTest(orgId: string, dto: Partial<Test>): Promise<Test> {
    return this.testRepo.save(this.testRepo.create({ ...dto, orgId }));
  }

  async submitTest(employeeId: string, testId: string, answers: Record<string, string>): Promise<TestResult> {
    const test = await this.testRepo.findOne({ where: { id: testId } });
    if (!test) throw new NotFoundException('Тест не найден');

    let correct = 0;
    for (const q of test.questions) {
      if (answers[q.id] === q.correctOptionId) correct++;
    }

    const score = test.questions.length > 0
      ? Math.round((correct / test.questions.length) * 100)
      : 0;

    const passed = score >= test.passScore;

    return this.resultRepo.save(
      this.resultRepo.create({
        employeeId,
        testId,
        score,
        passed,
        completedAt: new Date(),
        answers,
      }),
    );
  }
}
