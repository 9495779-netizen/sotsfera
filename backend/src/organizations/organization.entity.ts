import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

export interface OrgPlan {
  maxWorkers: number;
  modules: string[];
}

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  inn: string;

  @Column({ nullable: true })
  ogrn: string;

  @Column({ name: 'legal_address', nullable: true })
  legalAddress: string;

  @Column({ type: 'jsonb', default: { maxWorkers: 50, modules: [] } })
  plan: OrgPlan;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
