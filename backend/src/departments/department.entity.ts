import { Entity, Column, Index, Tree, TreeParent, TreeChildren } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('departments')
@Tree('closure-table')
@Index(['orgId'])
export class Department extends BaseEntity {
  @Column({ name: 'org_id' })
  orgId: string;

  @Column()
  name: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ name: 'head_employee_id', nullable: true })
  headEmployeeId: string;

  @TreeParent()
  parent: Department;

  @TreeChildren()
  children: Department[];
}
