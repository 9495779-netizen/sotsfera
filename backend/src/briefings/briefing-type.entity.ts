import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

export enum BriefingTypeName {
  INDUCTION = 'вводный',
  PRIMARY = 'первичный',
  REPEATED = 'повторный',
  UNPLANNED = 'внеплановый',
  TARGETED = 'целевой',
}

@Entity('briefing_types')
export class BriefingType extends BaseEntity {
  @Column({ type: 'enum', enum: BriefingTypeName, unique: true })
  name: BriefingTypeName;

  @Column({ name: 'period_days', nullable: true })
  periodDays: number;

  @Column({ name: 'is_configurable', default: false })
  isConfigurable: boolean;
}
