import { Module } from '@nestjs/common';
import { InventoryModule } from './inventory/inventory.module';
import { WarehouseModule } from './warehouse/warehouse.module';

@Module({
  imports: [InventoryModule, WarehouseModule],
})
export class WarehousesModule {}
