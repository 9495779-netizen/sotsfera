import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { Employee } from '../employees/employee.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User, Employee])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
