import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BriefingRecord } from './briefing-record.entity';
import { BriefingJournal } from './briefing-journal.entity';
import { BriefingType } from './briefing-type.entity';
import { BriefingsService } from './briefings.service';
import { BriefingsController } from './briefings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BriefingRecord, BriefingJournal, BriefingType])],
  providers: [BriefingsService],
  controllers: [BriefingsController],
  exports: [BriefingsService],
})
export class BriefingsModule {}
