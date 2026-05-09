import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly svc: OrganizationsService) {}

  @Get()
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Список организаций (Admin)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.svc.findAll(+page, +limit);
  }

  @Get(':id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.DIRECTOR, UserRole.OT_SPECIALIST)
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Создать организацию' })
  create(@Body() dto: any) {
    return this.svc.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.DIRECTOR)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  @Get(':id/legal-entities')
  legalEntities(@Param('id') id: string) {
    return this.svc.getLegalEntities(id);
  }

  @Post(':id/legal-entities')
  @Roles(UserRole.DIRECTOR, UserRole.OT_SPECIALIST)
  createLegalEntity(@Param('id') id: string, @Body() dto: any) {
    return this.svc.createLegalEntity(id, dto);
  }
}
