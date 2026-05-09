import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService, NOTIFICATION_QUEUE } from './scheduler.service';
import { BriefingRecord } from '../briefings/briefing-record.entity';
import { MedExamRecord } from '../medical/med-exam-record.entity';
import { TrainingRecord } from '../training/training-record.entity';
import { NotificationRule } from '../notifications/notification-rule.entity';
import { Employee } from '../employees/employee.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    TypeOrmModule.forFeature([
      BriefingRecord,
      MedExamRecord,
      TrainingRecord,
      NotificationRule,
      Employee,
    ]),
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
