import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number): Promise<any[]> {
    try {
      const warehouses = await this.prisma.warehouse.findMany({
        where: { user_id: userId },
      });
      return warehouses;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createDto: any): Promise<any> {
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
    } = createDto;
    try {
      const newWarehouse = await this.prisma.warehouse.create({
        data: {
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
        }
      });
      return newWarehouse;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateDto: any): Promise<any> {
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
    } = updateDto;
    try {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (address_line_1 !== undefined) updateData.address_line_1 = address_line_1;
      if (address_line_2 !== undefined) updateData.address_line_2 = address_line_2;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (postal_code !== undefined) updateData.postal_code = postal_code;
      if (country !== undefined) updateData.country = country;
      if (contact_person !== undefined) updateData.contact_person = contact_person;
      if (phone !== undefined) updateData.phone = phone;
      if (storage_capacity !== undefined) updateData.storage_capacity = storage_capacity;

      // Ensure we don't update if no fields (Prisma ignores update with empty data but good to check)
      if (Object.keys(updateData).length === 0) {
          // Could duplicate "return existing" logic but for now simple update
      }

      const updatedWarehouse = await this.prisma.warehouse.update({
        where: { warehouse_id: id },
        data: updateData,
      });

      return updatedWarehouse;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.warehouse.delete({ where: { warehouse_id: id } });
      return true;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.warehouse.deleteMany({});
      return { message: `Warehouse table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
