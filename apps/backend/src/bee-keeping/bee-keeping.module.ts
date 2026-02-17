import { Module } from '@nestjs/common';
import { ApicultureModule } from './apiculture/apiculture.module';
import { BeeHivesModule } from './bee-hives/bee-hives.module';
import { HiveInspectionModule } from './hive-inspection/hive-inspection.module';
import { HoneyProductionModule } from './honey-production/honey-production.module';

@Module({
  imports: [
    ApicultureModule,
    BeeHivesModule,
    HiveInspectionModule,
    HoneyProductionModule,
  ],
})
export class BeeKeepingModule {}
