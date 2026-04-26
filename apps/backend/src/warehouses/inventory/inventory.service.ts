import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';

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
  ): Promise<any[]> {
    const { limit, offset, itemGroup, warehouseId } = filters;

    try {
      const where: any = { user_id: userId };
      if (warehouseId !== undefined) where.warehouse_id = warehouseId;
      if (itemGroup) where.item_group = itemGroup;

      const inventory = await this.prisma.inventory.findMany({
        where,
        orderBy: [{ created_at: 'desc' }, { inventory_id: 'desc' }],
        take: limit,
        skip: offset,
        // Prisma doesn't support selecting specific columns alias like "COALESCE(minimum_limit, 0) as minimum_limit" easily in top level
        // But if minimum_limit is nullable, it returns null. Frontend handles it?
        // Original query: COALESCE(minimum_limit, 0)
        // I will let it return null if null, or map it.
        // Given return type any[], I can map.
      });

      return inventory.map((item) => ({
        ...item,
        minimum_limit: item.minimum_limit ?? 0,
      }));
    } catch (error) {
      console.error('Error executing query in findByUserIdWithFilters:', error);
      throw new InternalServerErrorException(
        `Database query failed: ${error.message}`,
      );
    }
  }

  async create(createDto: CreateInventoryDto): Promise<any> {
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
      return newItem;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateDto: UpdateInventoryDto): Promise<any> {
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
      const updateData: any = {};
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
      return updatedItem;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.inventory.delete({ where: { inventory_id: id } });
      return true;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.inventory.deleteMany({});
      return { message: `Inventory table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
