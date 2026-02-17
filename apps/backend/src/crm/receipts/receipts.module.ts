import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { ReceiptsRepository } from './receipts.repository';

@Module({
  controllers: [ReceiptsController],
  providers: [ReceiptsService, ReceiptsRepository],
})
export class ReceiptsModule {}
