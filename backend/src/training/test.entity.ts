import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

export interface TestQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

@Entity('tests')
@Index(['orgId'])
@Index(['programId'])
export class Test extends BaseEntity {
  @Column({ name: 'program_id' })
  programId: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column()
  name: string;

  @Column({ name: 'pass_score' })
  passScore: number;

  /** Вопросы хранятся в JSONB */
  @Column({ type: 'jsonb', default: [] })
  questions: TestQuestion[];

  @Column({ name: 'time_limit_min', nullable: true })
  timeLimitMin: number;
}
