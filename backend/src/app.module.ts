import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import configuration from './config/configuration';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuditLog } from './common/entities/audit-log.entity';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { BriefingsModule } from './briefings/briefings.module';
import { MedicalModule } from './medical/medical.module';
import { TrainingModule } from './training/training.module';
import { OrdersModule } from './orders/orders.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { PdfModule } from './pdf/pdf.module';

import { User } from './users/user.entity';
import { Organization } from './organizations/organization.entity';
import { LegalEntity } from './organizations/legal-entity.entity';
import { Department } from './departments/department.entity';
import { Position } from './departments/position.entity';
import { Employee } from './employees/employee.entity';
import { BriefingType } from './briefings/briefing-type.entity';
import { BriefingRecord } from './briefings/briefing-record.entity';
import { BriefingJournal } from './briefings/briefing-journal.entity';
import { MedExamRecord } from './medical/med-exam-record.entity';
import { MedDirection } from './medical/med-direction.entity';
import { TrainingProgram } from './training/training-program.entity';
import { TrainingRecord } from './training/training-record.entity';
import { KnowledgeProtocol } from './training/knowledge-protocol.entity';
import { Test } from './training/test.entity';
import { TestResult } from './training/test-result.entity';
import { OrderTemplate } from './orders/order-template.entity';
import { Order } from './orders/order.entity';
import { Document } from './documents/document.entity';
import { NotificationRule } from './notifications/notification-rule.entity';
import { NotificationLog } from './notifications/notification-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('database.host'),
        port: cfg.get('database.port'),
        username: cfg.get('database.username'),
        password: cfg.get('database.password'),
        database: cfg.get('database.database'),
        entities: [
          User, Organization, LegalEntity, Department, Position, Employee,
          BriefingType, BriefingRecord, BriefingJournal,
          MedExamRecord, MedDirection,
          TrainingProgram, TrainingRecord, KnowledgeProtocol, Test, TestResult,
          OrderTemplate, Order,
          Document,
          NotificationRule, NotificationLog,
          AuditLog,
        ],
        synchronize: cfg.get('nodeEnv') === 'development',
        logging: cfg.get('nodeEnv') === 'development',
        ssl: cfg.get('nodeEnv') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        redis: {
          host: cfg.get('redis.host'),
          port: cfg.get('redis.port'),
        },
      }),
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => [
        {
          ttl: cfg.get<number>('throttle.ttl')! * 1000,
          limit: cfg.get<number>('throttle.limit')!,
        },
      ],
    }),

    TypeOrmModule.forFeature([AuditLog]),

    AuthModule,
    UsersModule,
    OrganizationsModule,
    EmployeesModule,
    DepartmentsModule,
    BriefingsModule,
    MedicalModule,
    TrainingModule,
    OrdersModule,
    DocumentsModule,
    NotificationsModule,
    AnalyticsModule,
    AdminModule,
    SchedulerModule,
    PdfModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
