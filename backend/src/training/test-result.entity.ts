import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('test_results')
@Index(['employeeId'])
@Index(['testId'])
export class TestResult extends BaseEntity {
  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'test_id' })
  testId: string;

  @Column()
  score: number;

  @Column()
  passed: boolean;

  @Column({ name: 'completed_at', type: 'timestamptz' })
  completedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  answers: Record<string, string>;
}
