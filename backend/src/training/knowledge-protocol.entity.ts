import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

export interface CommissionMember {
  name: string;
  position: string;
  role: 'chairman' | 'member';
}

@Entity('knowledge_protocols')
@Index(['orgId'])
export class KnowledgeProtocol extends BaseEntity {
  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'commission_members', type: 'jsonb', default: [] })
  commissionMembers: CommissionMember[];

  @Column({ name: 'file_url', nullable: true })
  fileUrl: string;
}
