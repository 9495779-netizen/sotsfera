import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { Employee } from '../employees/employee.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Employee) private readonly empRepo: Repository<Employee>,
  ) {}

  async getPlatformMetrics() {
    const [totalOrgs, activeOrgs, totalWorkers] = await Promise.all([
      this.orgRepo.count(),
      this.orgRepo.count({ where: { isActive: true } }),
      this.empRepo.count(),
    ]);

    return { totalOrgs, activeOrgs, totalWorkers };
  }

  async getOrgConnectionDynamics() {
    const result = await this.orgRepo
      .createQueryBuilder('o')
      .select("DATE_TRUNC('month', o.created_at)", 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy("DATE_TRUNC('month', o.created_at)")
      .orderBy('month', 'ASC')
      .getRawMany();

    return result;
  }

  async toggleOrgStatus(orgId: string, isActive: boolean): Promise<void> {
    await this.orgRepo.update(orgId, { isActive });
  }

  async updateOrgPlan(orgId: string, plan: any): Promise<void> {
    await this.orgRepo.update(orgId, { plan });
  }
}
