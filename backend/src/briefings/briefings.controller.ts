import {
  Controller, Get, Post, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { BriefingsService } from './briefings.service';
import { CreateBriefingRecordDto, BulkConductDto, CreateJournalDto } from './dto/briefing.dto';
import { BriefingStatus } from './briefing-record.entity';

@ApiTags('briefings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('briefings')
export class BriefingsController {
  constructor(private readonly svc: BriefingsService) {}

  @Get('records')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR, UserRole.DEPT_HEAD)
  @ApiOperation({ summary: 'Список записей инструктажей' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('typeId') typeId?: string,
    @Query('status') status?: BriefingStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.svc.findAllRecords(user.orgId!, { typeId, status, from, to, page: +page, limit: +limit });
  }

  @Post('conduct')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR, UserRole.DEPT_HEAD)
  @ApiOperation({ summary: 'Провести инструктаж (одиночный)' })
  conduct(@CurrentUser() user: JwtPayload, @Body() dto: CreateBriefingRecordDto) {
    return this.svc.conductBriefing(user.orgId!, dto);
  }

  @Post('conduct/bulk')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Провести инструктаж (массовый)' })
  bulkConduct(@CurrentUser() user: JwtPayload, @Body() dto: BulkConductDto) {
    const { employeeIds, ...rest } = dto;
    return this.svc.bulkConduct(user.orgId!, employeeIds, rest);
  }

  @Get('upcoming')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Инструктажи с истекающим сроком (30 дней)' })
  upcoming(@CurrentUser() user: JwtPayload, @Query('days') days = 30) {
    return this.svc.findUpcoming(user.orgId!, +days);
  }

  @Get('journals')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Список журналов инструктажей' })
  journals(@CurrentUser() user: JwtPayload) {
    return this.svc.findJournals(user.orgId!);
  }

  @Post('journals')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Сформировать журнал инструктажей (PDF)' })
  createJournal(@CurrentUser() user: JwtPayload, @Body() dto: CreateJournalDto) {
    return this.svc.createJournal(user.orgId!, dto);
  }
}
