import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { TrainingService } from './training.service';

@ApiTags('training')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('training')
export class TrainingController {
  constructor(private readonly svc: TrainingService) {}

  @Get('programs')
  @ApiOperation({ summary: 'Программы обучения' })
  programs(@CurrentUser() u: JwtPayload) {
    return this.svc.findPrograms(u.orgId!);
  }

  @Post('programs')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  createProgram(@CurrentUser() u: JwtPayload, @Body() dto: any) {
    return this.svc.createProgram(u.orgId!, dto);
  }

  @Get('records')
  @ApiOperation({ summary: 'Записи об обучении' })
  records(
    @CurrentUser() u: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.svc.findRecords(u.orgId!, +page, +limit);
  }

  @Post('records')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  createRecord(@CurrentUser() u: JwtPayload, @Body() dto: any) {
    return this.svc.createRecord(u.orgId!, dto);
  }

  @Get('protocols')
  @ApiOperation({ summary: 'Протоколы проверки знаний' })
  protocols(@CurrentUser() u: JwtPayload) {
    return this.svc.findProtocols(u.orgId!);
  }

  @Post('protocols')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  createProtocol(@CurrentUser() u: JwtPayload, @Body() dto: any) {
    return this.svc.createProtocol(u.orgId!, dto);
  }

  @Get('tests/:testId')
  @ApiOperation({ summary: 'Получить тест (без правильных ответов)' })
  getTest(@CurrentUser() u: JwtPayload, @Param('testId') testId: string) {
    return this.svc.findTest(u.orgId!, testId);
  }

  @Post('tests')
  @Roles(UserRole.OT_SPECIALIST, UserRole.DIRECTOR)
  createTest(@CurrentUser() u: JwtPayload, @Body() dto: any) {
    return this.svc.createTest(u.orgId!, dto);
  }

  @Post('tests/:testId/submit')
  @ApiOperation({ summary: 'Отправить ответы на тест' })
  submitTest(
    @CurrentUser() u: JwtPayload,
    @Param('testId') testId: string,
    @Body() body: { answers: Record<string, string> },
  ) {
    return this.svc.submitTest(u.sub, testId, body.answers);
  }
}
