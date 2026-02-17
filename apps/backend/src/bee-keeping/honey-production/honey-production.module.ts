import { Module } from '@nestjs/common';
import { HoneyProductionController } from './honey-production.controller';
import { HoneyProductionService } from './honey-production.service';

@Module({
  controllers: [HoneyProductionController],
  providers: [HoneyProductionService],
})
export class HoneyProductionModule {}
