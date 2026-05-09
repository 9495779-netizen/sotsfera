import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { DepartmentsService } from './departments.service';

@ApiTags('departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly svc: DepartmentsService) {}

  @Get()
  findAll(@CurrentUser() u: JwtPayload) {
    return this.svc.findAll(u.orgId!);
  }

  @Post()
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  create(@CurrentUser() u: JwtPayload, @Body() dto: any) {
    return this.svc.create(u.orgId!, dto);
  }

  @Put(':id')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  update(@CurrentUser() u: JwtPayload, @Param('id') id: string, @Body() dto: any) {
    return this.svc.update(u.orgId!, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  remove(@CurrentUser() u: JwtPayload, @Param('id') id: string) {
    return this.svc.remove(u.orgId!, id);
  }

  @Get('positions')
  positions(@CurrentUser() u: JwtPayload, @Query('deptId') deptId?: string) {
    return this.svc.findPositions(u.orgId!, deptId);
  }

  @Post('positions')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  createPosition(@CurrentUser() u: JwtPayload, @Body() dto: any) {
    return this.svc.createPosition(u.orgId!, dto);
  }
}
