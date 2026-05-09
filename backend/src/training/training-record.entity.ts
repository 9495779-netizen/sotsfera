import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

export enum TrainingResult {
  PASSED = 'сдал',
  FAILED = 'не сдал',
  IN_PROGRESS = 'в процессе',
}

@Entity('training_records')
@Index(['orgId'])
@Index(['employeeId'])
@Index(['nextDueAt'])
export class TrainingRecord extends BaseEntity {
  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'program_id' })
  programId: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: TrainingResult, nullable: true })
  result: TrainingResult;

  @Column({ nullable: true })
  score: number;

  @Column({ name: 'cert_number', nullable: true })
  certNumber: string;

  @Column({ name: 'next_due_at', type: 'date', nullable: true })
  nextDueAt: Date;

  @Column({ name: 'training_center', nullable: true })
  trainingCenter: string;
}
