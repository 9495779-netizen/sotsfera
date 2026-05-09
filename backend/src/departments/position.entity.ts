import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { BriefingTypeName } from '../briefings/briefing-type.entity';

export enum HarmfulClass {
  CLASS_1 = 1,
  CLASS_2 = 2,
  CLASS_3 = 3,
  CLASS_4 = 4,
}

@Entity('positions')
@Index(['deptId'])
export class Position extends BaseEntity {
  @Column({ name: 'dept_id' })
  deptId: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column()
  name: string;

  @Column({ name: 'harmful_class', type: 'int', nullable: true })
  harmfulClass: HarmfulClass;

  @Column({ name: 'briefing_types', type: 'text', array: true, default: [] })
  briefingTypes: BriefingTypeName[];

  @Column({ name: 'requires_medical', default: false })
  requiresMedical: boolean;
}
