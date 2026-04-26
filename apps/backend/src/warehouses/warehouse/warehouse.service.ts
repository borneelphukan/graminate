import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './warehouse.dto';
import { Prisma, warehouse } from '@prisma/client';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number): Promise<warehouse[]> {
    try {
      const warehouses = await this.prisma.warehouse.findMany({
        where: { user_id: userId },
      });
      return warehouses.map((w) => ({
        ...w,
        storage_capacity: w.storage_capacity
          ? Number(w.storage_capacity)
          : null,
      })) as warehouse[];
    } catch (error) {
      console.error('Error in WarehouseService.findByUserId:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async create(createDto: CreateWarehouseDto): Promise<warehouse> {
    const {
      user_id,
      name,
      type,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      contact_person,
      phone,
      storage_capacity,
      category,
    } = createDto;

    try {
      const data: Prisma.warehouseCreateInput = {
        name: name,
        type: type || 'Unassigned',
        address_line_1: address_line_1 || 'Unassigned',
        address_line_2: address_line_2 || null,
        city: city || 'Unassigned',
        state: state || 'Unassigned',
        postal_code: postal_code || 'Unassigned',
        country: country || 'Unassigned',
        contact_person: contact_person || null,
        phone: phone || null,
        category: category || null,
      };

      if (user_id !== undefined && user_id !== null) {
        data.users = { connect: { user_id: Number(user_id) } };
      }

      if (storage_capacity !== undefined && storage_capacity !== null) {
        data.storage_capacity = Number(storage_capacity);
      }

      const newWarehouse = await this.prisma.warehouse.create({ data });

      // Convert Decimal to number for serialization safety
      return {
        ...newWarehouse,
        storage_capacity: newWarehouse.storage_capacity
          ? Number(newWarehouse.storage_capacity)
          : null,
      } as warehouse;
    } catch (error) {
      console.error('Error in WarehouseService.create:', error);
      throw new InternalServerErrorException(
        `Warehouse creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(id: number, updateDto: UpdateWarehouseDto): Promise<warehouse> {
    const {
      name,
      type,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      contact_person,
      phone,
      storage_capacity,
      category,
    } = updateDto;

    try {
      const updateData: Prisma.warehouseUpdateInput = {};
      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (address_line_1 !== undefined)
        updateData.address_line_1 = address_line_1;
      if (address_line_2 !== undefined)
        updateData.address_line_2 = address_line_2;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (postal_code !== undefined) updateData.postal_code = postal_code;
      if (country !== undefined) updateData.country = country;
      if (contact_person !== undefined)
        updateData.contact_person = contact_person;
      if (phone !== undefined) updateData.phone = phone;
      if (storage_capacity !== undefined)
        updateData.storage_capacity =
          storage_capacity !== null ? Number(storage_capacity) : null;
      if (category !== undefined) updateData.category = category;

      const updatedWarehouse = await this.prisma.warehouse.update({
        where: { warehouse_id: id },
        data: updateData,
      });

      return {
        ...updatedWarehouse,
        storage_capacity: updatedWarehouse.storage_capacity
          ? Number(updatedWarehouse.storage_capacity)
          : null,
      } as warehouse;
    } catch (error) {
      console.error('Error in WarehouseService.update:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.warehouse.delete({ where: { warehouse_id: id } });
      return true;
    } catch (error) {
      console.error('Error in WarehouseService.delete:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.warehouse.deleteMany({
        where: { user_id: userId ? Number(userId) : undefined },
      });
      return { message: `Warehouse table reset for user ${userId}` };
    } catch (error) {
      console.error('Error in WarehouseService.resetTable:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async deleteByUserIdAndCategory(
    userId: number,
    category: string,
  ): Promise<boolean> {
    try {
      await this.prisma.warehouse.deleteMany({
        where: {
          user_id:
            userId !== undefined && userId !== null
              ? Number(userId)
              : undefined,
          category: category,
        },
      });
      return true;
    } catch (error) {
      console.error('Error in deleteByUserIdAndCategory:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
