import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';
import { LegalEntity } from './legal-entity.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(LegalEntity)
    private readonly leRepo: Repository<LegalEntity>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [items, total] = await this.orgRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Организация не найдена');
    return org;
  }

  async create(dto: Partial<Organization>): Promise<Organization> {
    return this.orgRepo.save(this.orgRepo.create(dto));
  }

  async update(id: string, dto: Partial<Organization>): Promise<Organization> {
    await this.findOne(id);
    await this.orgRepo.update(id, dto);
    return this.findOne(id);
  }

  async getLegalEntities(orgId: string): Promise<LegalEntity[]> {
    return this.leRepo.find({ where: { orgId } });
  }

  async createLegalEntity(orgId: string, dto: Partial<LegalEntity>): Promise<LegalEntity> {
    return this.leRepo.save(this.leRepo.create({ ...dto, orgId }));
  }
}
