import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { Position } from './position.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private readonly deptRepo: Repository<Department>,
    @InjectRepository(Position) private readonly posRepo: Repository<Position>,
  ) {}

  async findAll(orgId: string): Promise<Department[]> {
    return this.deptRepo.find({ where: { orgId }, order: { name: 'ASC' } });
  }

  async findOne(orgId: string, id: string): Promise<Department> {
    const dept = await this.deptRepo.findOne({ where: { id, orgId } });
    if (!dept) throw new NotFoundException('Подразделение не найдено');
    return dept;
  }

  async create(orgId: string, dto: Partial<Department>): Promise<Department> {
    return this.deptRepo.save(this.deptRepo.create({ ...dto, orgId }));
  }

  async update(orgId: string, id: string, dto: Partial<Department>): Promise<Department> {
    await this.findOne(orgId, id);
    await this.deptRepo.update(id, dto);
    return this.findOne(orgId, id);
  }

  async remove(orgId: string, id: string): Promise<void> {
    await this.findOne(orgId, id);
    await this.deptRepo.delete(id);
  }

  async findPositions(orgId: string, deptId?: string): Promise<Position[]> {
    const where: any = { orgId };
    if (deptId) where.deptId = deptId;
    return this.posRepo.find({ where, order: { name: 'ASC' } });
  }

  async createPosition(orgId: string, dto: Partial<Position>): Promise<Position> {
    return this.posRepo.save(this.posRepo.create({ ...dto, orgId }));
  }
}
