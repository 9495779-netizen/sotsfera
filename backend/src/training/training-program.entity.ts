import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('training_programs')
@Index(['orgId'])
export class TrainingProgram extends BaseEntity {
  @Column({ name: 'org_id' })
  orgId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  topic: string;

  @Column({ name: 'duration_hours', nullable: true })
  durationHours: number;

  @Column({ name: 'validity_months', nullable: true })
  validityMonths: number;
}
