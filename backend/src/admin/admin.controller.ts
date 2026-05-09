import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PLATFORM_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Метрики платформы' })
  metrics() {
    return this.svc.getPlatformMetrics();
  }

  @Get('dynamics')
  @ApiOperation({ summary: 'Динамика подключений по месяцам' })
  dynamics() {
    return this.svc.getOrgConnectionDynamics();
  }

  @Put('organizations/:id/status')
  @ApiOperation({ summary: 'Включить/отключить организацию' })
  toggleStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.svc.toggleOrgStatus(id, body.isActive);
  }

  @Put('organizations/:id/plan')
  @ApiOperation({ summary: 'Обновить тариф организации' })
  updatePlan(@Param('id') id: string, @Body() plan: any) {
    return this.svc.updateOrgPlan(id, plan);
  }
}
