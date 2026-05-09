import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

export enum JournalType {
  INDUCTION = 'вводный',
  WORKPLACE = 'рабочее_место',
}

export enum SignType {
  PDF = 'pdf',
  EP = 'ep',
}

@Entity('briefing_journals')
@Index(['orgId'])
export class BriefingJournal extends BaseEntity {
  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ name: 'journal_type', type: 'enum', enum: JournalType })
  journalType: JournalType;

  @Column({ name: 'period_start', type: 'date' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: Date;

  @Column({ name: 'file_url', nullable: true })
  fileUrl: string;

  @Column({ name: 'signed_at', type: 'timestamptz', nullable: true })
  signedAt: Date;

  @Column({ name: 'sign_type', type: 'enum', enum: SignType, nullable: true })
  signType: SignType;
}
