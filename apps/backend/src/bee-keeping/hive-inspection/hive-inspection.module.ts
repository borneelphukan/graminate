import { Module } from '@nestjs/common';
import { HiveInspectionController } from './hive-inspection.controller';
import { HiveInspectionService } from './hive-inspection.service';

@Module({
  controllers: [HiveInspectionController],
  providers: [HiveInspectionService],
})
export class HiveInspectionModule {}
