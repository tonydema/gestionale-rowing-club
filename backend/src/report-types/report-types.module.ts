import { Module } from '@nestjs/common';
import { ReportTypesService } from './report-types.service';
import { ReportTypesController } from './report-types.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportTypesController],
  providers: [ReportTypesService],
  exports: [ReportTypesService],
})
export class ReportTypesModule {}
