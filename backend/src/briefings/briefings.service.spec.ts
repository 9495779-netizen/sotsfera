import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BriefingsService } from './briefings.service';
import { BriefingRecord, BriefingStatus } from './briefing-record.entity';
import { BriefingJournal } from './briefing-journal.entity';
import { BriefingType, BriefingTypeName } from './briefing-type.entity';
import { NotFoundException } from '@nestjs/common';

const mockType: Partial<BriefingType> = {
  id: 'type-1',
  name: BriefingTypeName.REPEATED,
  periodDays: 180,
};

const mockRecord: Partial<BriefingRecord> = {
  id: 'rec-1',
  orgId: 'org-1',
  employeeId: 'emp-1',
  typeId: 'type-1',
  status: BriefingStatus.PLANNED,
  nextDueAt: new Date(Date.now() + 5 * 86400000),
};

const makeRepo = (items: any[] = []) => ({
  createQueryBuilder: jest.fn().mockReturnThis(),
  leftJoinAndMapOne: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([items, items.length]),
  find: jest.fn().mockResolvedValue(items),
  findOne: jest.fn().mockResolvedValue(items[0] ?? null),
  create: jest.fn().mockImplementation((dto) => dto),
  save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'new-id', ...e })),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  execute: jest.fn().mockResolvedValue({ affected: 3 }),
});

describe('BriefingsService', () => {
  let service: BriefingsService;
  let recordRepo: ReturnType<typeof makeRepo>;
  let typeRepo: ReturnType<typeof makeRepo>;
  let journalRepo: ReturnType<typeof makeRepo>;

  beforeEach(async () => {
    recordRepo = makeRepo([mockRecord]);
    typeRepo = makeRepo([mockType]);
    journalRepo = makeRepo([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BriefingsService,
        { provide: getRepositoryToken(BriefingRecord), useValue: recordRepo },
        { provide: getRepositoryToken(BriefingJournal), useValue: journalRepo },
        { provide: getRepositoryToken(BriefingType), useValue: typeRepo },
      ],
    }).compile();

    service = module.get<BriefingsService>(BriefingsService);
  });

  describe('conductBriefing', () => {
    it('создаёт запись и вычисляет следующий срок', async () => {
      const result = await service.conductBriefing('org-1', {
        employeeId: 'emp-1',
        typeId: 'type-1',
        conductedAt: new Date().toISOString(),
      });

      expect(recordRepo.save).toHaveBeenCalledTimes(1);
      const saved = recordRepo.save.mock.calls[0][0];
      expect(saved.status).toBe(BriefingStatus.COMPLETED);
      expect(saved.nextDueAt).toBeDefined();
    });

    it('выбрасывает NotFoundException если тип не найден', async () => {
      typeRepo.findOne.mockResolvedValue(null);
      await expect(
        service.conductBriefing('org-1', {
          employeeId: 'emp-1',
          typeId: 'bad-type',
          conductedAt: new Date().toISOString(),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markOverdue', () => {
    it('обновляет просроченные статусы', async () => {
      recordRepo.createQueryBuilder.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      });

      const count = await service.markOverdue('org-1');
      expect(count).toBe(5);
    });
  });

  describe('findUpcoming', () => {
    it('возвращает запланированные инструктажи в горизонте 30 дней', async () => {
      const result = await service.findUpcoming('org-1', 30);
      expect(recordRepo.find).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('bulkConduct', () => {
    it('проводит инструктаж для нескольких сотрудников', async () => {
      const { succeeded, failed } = await service.bulkConduct('org-1', ['emp-1', 'emp-2'], {
        typeId: 'type-1',
        conductedAt: new Date().toISOString(),
      });
      expect(succeeded).toBe(2);
      expect(failed).toBe(0);
    });
  });
});
