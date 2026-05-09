import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('legal_entities')
@Index(['orgId'])
export class LegalEntity extends BaseEntity {
  @Column({ name: 'org_id' })
  orgId: string;

  @Column()
  name: string;

  @Column()
  inn: string;

  @Column({ nullable: true })
  ogrn: string;

  @Column({ name: 'director_name', nullable: true })
  directorName: string;
}
