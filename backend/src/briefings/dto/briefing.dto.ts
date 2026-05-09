import { IsString, IsUUID, IsDateString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBriefingRecordDto {
  @ApiProperty()
  @IsUUID()
  employeeId: string;

  @ApiProperty()
  @IsUUID()
  typeId: string;

  @ApiProperty({ example: '2024-03-15T10:00:00Z' })
  @IsDateString()
  conductedAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  instructorId?: string;
}

export class BulkConductDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID(4, { each: true })
  employeeIds: string[];

  @ApiProperty()
  @IsUUID()
  typeId: string;

  @ApiProperty()
  @IsDateString()
  conductedAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  instructorId?: string;
}

export class CreateJournalDto {
  @ApiProperty()
  @IsString()
  journalType: string;

  @ApiProperty()
  @IsDateString()
  periodStart: string;

  @ApiProperty()
  @IsDateString()
  periodEnd: string;
}
