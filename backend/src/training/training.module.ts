import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingProgram } from './training-program.entity';
import { TrainingRecord } from './training-record.entity';
import { KnowledgeProtocol } from './knowledge-protocol.entity';
import { Test } from './test.entity';
import { TestResult } from './test-result.entity';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingProgram,
      TrainingRecord,
      KnowledgeProtocol,
      Test,
      TestResult,
    ]),
  ],
  providers: [TrainingService],
  controllers: [TrainingController],
  exports: [TrainingService],
})
export class TrainingModule {}
