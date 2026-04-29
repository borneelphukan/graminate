import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';
import { Prisma, inventory } from '@prisma/client';

interface InventoryFilters {
  limit?: number;
  offset?: number;
  itemGroup?: string;
  warehouseId?: number;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserIdWithFilters(
    userId: number,
    filters: InventoryFilters,
  ): Promise<inventory[]> {
    const { limit, offset, itemGroup, warehouseId } = filters;

    try {
      const where: Prisma.inventoryWhereInput = { user_id: userId };
      if (warehouseId !== undefined) where.warehouse_id = warehouseId;
      if (itemGroup) where.item_group = itemGroup;

      const inventoryItems = await this.prisma.inventory.findMany({
        where,
        orderBy: [{ created_at: 'desc' }, { inventory_id: 'desc' }],
        take: limit,
        skip: offset,
      });

      return inventoryItems.map((item) => ({
        ...item,
        price_per_unit: item.price_per_unit ? Number(item.price_per_unit) : 0,
        minimum_limit: item.minimum_limit ?? 0,
      })) as unknown as inventory[];
    } catch (error) {
      console.error('Error executing query in findByUserIdWithFilters:', error);
      throw new InternalServerErrorException(
        `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async create(createDto: CreateInventoryDto): Promise<inventory> {
    const {
      user_id,
      item_name,
      item_group,
      units,
      quantity,
      price_per_unit,
      warehouse_id,
      minimum_limit,
      feed,
    } = createDto;
    try {
      const newItem = await this.prisma.inventory.create({
        data: {
          user_id,
          item_name,
          item_group,
          units,
          quantity,
          price_per_unit,
          warehouse_id,
          minimum_limit,
          feed,
        },
      });
      return {
        ...newItem,
        price_per_unit: newItem.price_per_unit
          ? Number(newItem.price_per_unit)
          : 0,
      } as unknown as inventory;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(id: number, updateDto: UpdateInventoryDto): Promise<inventory> {
    const {
      item_name,
      item_group,
      units,
      quantity,
      price_per_unit,
      minimum_limit,
      feed,
    } = updateDto;
    try {
      const updateData: Prisma.inventoryUpdateInput = {};
      if (item_name !== undefined) updateData.item_name = item_name;
      if (item_group !== undefined) updateData.item_group = item_group;
      if (units !== undefined) updateData.units = units;
      if (quantity !== undefined) updateData.quantity = quantity;
      if (price_per_unit !== undefined)
        updateData.price_per_unit = price_per_unit;
      if (minimum_limit !== undefined) updateData.minimum_limit = minimum_limit;
      if (feed !== undefined) updateData.feed = feed;

      const updatedItem = await this.prisma.inventory.update({
        where: { inventory_id: id },
        data: updateData,
      });
      return {
        ...updatedItem,
        price_per_unit: updatedItem.price_per_unit
          ? Number(updatedItem.price_per_unit)
          : 0,
      } as unknown as inventory;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.inventory.delete({ where: { inventory_id: id } });
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.inventory.deleteMany({});
      return { message: `Inventory table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
