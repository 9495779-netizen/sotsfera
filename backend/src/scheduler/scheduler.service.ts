import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { addDays, differenceInDays } from 'date-fns';
import { BriefingRecord, BriefingStatus } from '../briefings/briefing-record.entity';
import { MedExamRecord } from '../medical/med-exam-record.entity';
import { TrainingRecord } from '../training/training-record.entity';
import { NotificationRule, NotificationEventType } from '../notifications/notification-rule.entity';
import { Employee } from '../employees/employee.entity';

export const NOTIFICATION_QUEUE = 'notification-queue';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notifQueue: Queue,
    @InjectRepository(BriefingRecord)
    private readonly briefingRepo: Repository<BriefingRecord>,
    @InjectRepository(MedExamRecord)
    private readonly medRepo: Repository<MedExamRecord>,
    @InjectRepository(TrainingRecord)
    private readonly trainingRepo: Repository<TrainingRecord>,
    @InjectRepository(NotificationRule)
    private readonly ruleRepo: Repository<NotificationRule>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  /** Ежедневно в 06:00 МСК (UTC+3) */
  @Cron('0 3 * * *', { timeZone: 'UTC' })
  async runDailyChecks(): Promise<void> {
    this.logger.log('Запуск ежедневных проверок сроков');
    await Promise.allSettled([
      this.checkBriefingDeadlines(),
      this.checkMedExamDeadlines(),
      this.checkTrainingDeadlines(),
      this.markOverdue(),
    ]);
    this.logger.log('Ежедневные проверки завершены');
  }

  async checkBriefingDeadlines(): Promise<void> {
    const horizon = addDays(new Date(), 30);
    const records = await this.briefingRepo.find({
      where: {
        status: BriefingStatus.PLANNED,
        nextDueAt: Between(new Date(), horizon),
      },
    });

    for (const record of records) {
      const rules = await this.ruleRepo.find({
        where: {
          orgId: record.orgId,
          eventType: NotificationEventType.BRIEFING_DEADLINE,
          isActive: true,
        },
      });

      for (const rule of rules) {
        const daysLeft = differenceInDays(record.nextDueAt, new Date());
        if (rule.daysBefore.some((d) => Math.abs(d - daysLeft) <= 0)) {
          await this.enqueueNotification(
            NotificationEventType.BRIEFING_DEADLINE,
            record,
            rule,
            daysLeft,
          );
        }
      }
    }
  }

  async checkMedExamDeadlines(): Promise<void> {
    const horizon = addDays(new Date(), 30);
    const records = await this.medRepo.find({
      where: { nextDueAt: Between(new Date(), horizon) },
    });

    for (const record of records) {
      const rules = await this.ruleRepo.find({
        where: {
          orgId: record.orgId,
          eventType: NotificationEventType.MED_EXAM_DEADLINE,
          isActive: true,
        },
      });

      for (const rule of rules) {
        const daysLeft = differenceInDays(record.nextDueAt, new Date());
        if (rule.daysBefore.some((d) => Math.abs(d - daysLeft) <= 0)) {
          await this.enqueueNotification(
            NotificationEventType.MED_EXAM_DEADLINE,
            record,
            rule,
            daysLeft,
          );
        }
      }
    }
  }

  async checkTrainingDeadlines(): Promise<void> {
    const horizon = addDays(new Date(), 30);
    const records = await this.trainingRepo.find({
      where: { nextDueAt: Between(new Date(), horizon) },
    });

    for (const record of records) {
      const rules = await this.ruleRepo.find({
        where: {
          orgId: record.orgId,
          eventType: NotificationEventType.TRAINING_DEADLINE,
          isActive: true,
        },
      });

      for (const rule of rules) {
        const daysLeft = differenceInDays(record.nextDueAt, new Date());
        if (rule.daysBefore.some((d) => Math.abs(d - daysLeft) <= 0)) {
          await this.enqueueNotification(
            NotificationEventType.TRAINING_DEADLINE,
            record,
            rule,
            daysLeft,
          );
        }
      }
    }
  }

  async markOverdue(): Promise<void> {
    const now = new Date();

    await this.briefingRepo
      .createQueryBuilder()
      .update(BriefingRecord)
      .set({ status: BriefingStatus.OVERDUE })
      .where('status = :status AND next_due_at < :now', {
        status: BriefingStatus.PLANNED,
        now,
      })
      .execute();

    this.logger.log('markOverdue: статусы обновлены');
  }

  private async enqueueNotification(
    eventType: NotificationEventType,
    record: any,
    rule: NotificationRule,
    daysLeft: number,
  ): Promise<void> {
    const employee = await this.employeeRepo.findOne({
      where: { id: record.employeeId },
    });
    if (!employee) return;

    for (const channel of rule.channels) {
      await this.notifQueue.add(
        channel,
        {
          eventType,
          channel,
          orgId: rule.orgId,
          employeeId: employee.id,
          employeeName: `${employee.lastName} ${employee.firstName}`,
          daysLeft,
          dueDate: record.nextDueAt,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
        },
      );
    }
  }
}
