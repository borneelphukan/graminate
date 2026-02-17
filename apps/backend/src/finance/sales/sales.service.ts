import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSaleDto, UpdateSaleDto } from './sales.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number): Promise<any[]> {
    try {
      const sales = await this.prisma.sales.findMany({
        where: { user_id: userId },
        orderBy: [
          { sales_date: 'desc' },
          { created_at: 'desc' },
          { sales_id: 'desc' },
        ],
      });
      return sales;
    } catch (error) {
      console.error('Error in SalesService.findByUserId:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(saleId: number): Promise<any> {
    try {
      const sale = await this.prisma.sales.findUnique({
        where: { sales_id: Number(saleId) },
      });
      return sale || null;
    } catch (error) {
      console.error('Error in SalesService.findById:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createDto: CreateSaleDto): Promise<any> {
    const {
      user_id,
      sales_name,
      sales_date,
      occupation,
      items_sold,
      quantities_sold,
      prices_per_unit,
      quantity_unit,
      invoice_created = false,
    } = createDto;

    if (items_sold.length !== quantities_sold.length) {
      throw new BadRequestException(
        'Items sold and quantities sold arrays must have the same length.',
      );
    }
    if (prices_per_unit && items_sold.length !== prices_per_unit.length) {
      throw new BadRequestException(
        'If prices per unit are provided, they must match the length of items sold.',
      );
    }

    try {
      const newSale = await this.prisma.sales.create({
        data: {
          user_id,
          sales_name,
          sales_date: new Date(sales_date),
          occupation,
          items_sold,
          quantities_sold,
          prices_per_unit,
          quantity_unit,
          invoice_created: invoice_created || false,
        },
      });
      return newSale;
    } catch (error) {
      console.error('Error in SalesService.create:', error);
      // Prisma error for constraint violation might need checking if specific constraint name is exposed or just P2002/P2003
      // But preserving specific message "chk_items_quantities_prices_length" if possible, but that's DB level.
      // If Prisma throws raw error, we might see it.
      // For now, generic handler.
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateDto: UpdateSaleDto): Promise<any> {


    const currentSale = await this.findById(id);
    if (!currentSale) {
      throw new NotFoundException(`Sale with ID ${id} not found.`);
    }

    if (updateDto.invoice_created !== undefined) {
      // Logic for invoice_created handled in updateData construction later
    }

    const finalItemsSold = updateDto.items_sold !== undefined ? updateDto.items_sold : currentSale.items_sold;
    const finalQuantitiesSold = updateDto.quantities_sold !== undefined ? updateDto.quantities_sold : currentSale.quantities_sold;
    const finalPricesPerUnit = updateDto.prices_per_unit !== undefined ? updateDto.prices_per_unit : currentSale.prices_per_unit;

    if (finalItemsSold.length !== finalQuantitiesSold.length) {
      throw new BadRequestException(
        'After update, items sold and quantities sold arrays must have the same length.',
      );
    }
    if (
      finalPricesPerUnit &&
      finalItemsSold.length !== finalPricesPerUnit.length
    ) {
      throw new BadRequestException(
        'After update, if prices per unit are provided, they must match the length of items sold.',
      );
    }

    try {
      const updateData: any = {};
      if (updateDto.sales_name !== undefined) updateData.sales_name = updateDto.sales_name;
      if (updateDto.sales_date !== undefined) updateData.sales_date = new Date(updateDto.sales_date);
      if (updateDto.occupation !== undefined) updateData.occupation = updateDto.occupation;
      if (updateDto.items_sold !== undefined) updateData.items_sold = updateDto.items_sold;
      if (updateDto.quantities_sold !== undefined) updateData.quantities_sold = updateDto.quantities_sold;
      if (updateDto.prices_per_unit !== undefined) updateData.prices_per_unit = updateDto.prices_per_unit;
      if (updateDto.quantity_unit !== undefined) updateData.quantity_unit = updateDto.quantity_unit;
      if (updateDto.invoice_created !== undefined) updateData.invoice_created = updateDto.invoice_created;

      if (Object.keys(updateData).length === 0) {
        return currentSale;
      }

      const updatedSale = await this.prisma.sales.update({
        where: { sales_id: id },
        data: updateData,
      });

      return updatedSale;
    } catch (error) {
      console.error('Error in SalesService.update:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.sales.delete({ where: { sales_id: id } });
      return true;
    } catch (error) {
      console.error('Error in SalesService.delete:', error);
      // Prisma throws error if not found? No, delete expects it to exist depending on how invoked, but `delete` throws P2025 if not found.
      // returning boolean based on success.
      // Since `findById` check wasn't here, it implies strict delete.
      // If error, return false or throw? Original threw InternalServerErrorException.
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.sales.deleteMany({});
      return { message: `Sales table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteByOccupationAndUser(
    userId: number,
    occupation: string,
  ): Promise<{ message: string; deletedCount: number }> {
    try {
      const result = await this.prisma.sales.deleteMany({
        where: { user_id: userId, occupation },
      });
      return {
        message: `Sales for user ${userId} with occupation '${occupation}' deleted.`,
        deletedCount: result.count,
      };
    } catch (error) {
      console.error('Error in SalesService.deleteByOccupationAndUser:', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
