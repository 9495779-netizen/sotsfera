import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfService } from './pdf.service';
import { BriefingJournal } from '../briefings/briefing-journal.entity';
import { BriefingRecord } from '../briefings/briefing-record.entity';
import { MedDirection } from '../medical/med-direction.entity';
import { KnowledgeProtocol } from '../training/knowledge-protocol.entity';
import { Order } from '../orders/order.entity';
import { Document } from '../documents/document.entity';
import { Employee } from '../employees/employee.entity';
import { Organization } from '../organizations/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BriefingJournal,
      BriefingRecord,
      MedDirection,
      KnowledgeProtocol,
      Order,
      Document,
      Employee,
      Organization,
    ]),
  ],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
