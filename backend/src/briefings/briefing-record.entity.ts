import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

export enum BriefingStatus {
  PLANNED = 'запланирован',
  COMPLETED = 'проведён',
  OVERDUE = 'просрочен',
}

@Entity('briefing_records')
@Index(['orgId'])
@Index(['employeeId'])
@Index(['nextDueAt'])
@Index(['status'])
export class BriefingRecord extends BaseEntity {
  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'type_id' })
  typeId: string;

  @Column({ name: 'conducted_at', type: 'timestamptz', nullable: true })
  conductedAt: Date;

  @Column({ name: 'next_due_at', type: 'date', nullable: true })
  nextDueAt: Date;

  @Column({ name: 'instructor_id', nullable: true })
  instructorId: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ type: 'enum', enum: BriefingStatus, default: BriefingStatus.PLANNED })
  status: BriefingStatus;
}
