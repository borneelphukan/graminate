import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCattleMilkDto, UpdateCattleMilkDto } from './cattle-milk.dto';

@Injectable()
export class CattleMilkService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number): Promise<any[]> {
    try {
      const records = await this.prisma.cattle_milk.findMany({
        where: { user_id: userId },
        orderBy: [{ date_collected: 'desc' }, { milk_id: 'desc' }],
      });
      return records;
    } catch (error) {
      console.error('Error in CattleMilkService.findByUserId:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByCattleId(cattleId: number): Promise<any[]> {
    try {
      const records = await this.prisma.cattle_milk.findMany({
        where: { cattle_id: cattleId },
        orderBy: [{ date_collected: 'desc' }, { milk_id: 'desc' }],
      });
      return records;
    } catch (error) {
      console.error('Error in CattleMilkService.findByCattleId:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(milkId: number): Promise<any> {
    try {
      const record = await this.prisma.cattle_milk.findUnique({
        where: { milk_id: milkId },
      });
      return record || null;
    } catch (error) {
      console.error('Error in CattleMilkService.findById:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createDto: CreateCattleMilkDto): Promise<any> {
    const { user_id, cattle_id, date_collected, animal_name, milk_produced } =
      createDto;
    try {
      const newRecord = await this.prisma.cattle_milk.create({
        data: {
          user_id,
          cattle_id,
          date_collected: new Date(date_collected),
          animal_name,
          milk_produced,
        },
      });
      return newRecord;
    } catch (error) {
      console.error('Error in CattleMilkService.create:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateDto: UpdateCattleMilkDto): Promise<any> {
    const { date_collected, animal_name, milk_produced } = updateDto;

    try {
      const updateData: any = {};
      if (date_collected !== undefined)
        updateData.date_collected = new Date(date_collected);
      if (animal_name !== undefined) updateData.animal_name = animal_name;
      if (milk_produced !== undefined) updateData.milk_produced = milk_produced;

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedRecord = await this.prisma.cattle_milk.update({
        where: { milk_id: id },
        data: updateData,
      });

      return updatedRecord;
    } catch (error) {
      console.error('Error in CattleMilkService.update:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.cattle_milk.delete({ where: { milk_id: id } });
      return true;
    } catch (error) {
      console.error('Error in CattleMilkService.delete:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAnimalNamesByCattleId(cattleId: number): Promise<string[]> {
    try {
      // Find distinct animal names, not null, not empty, ordered ASC
      const result = await this.prisma.cattle_milk.findMany({
        where: {
          cattle_id: cattleId,
          animal_name: {
            not: null, // Prisma specific: cannot chain checks easily in 'where' for <> ''
          },
        },
        distinct: ['animal_name'],
        orderBy: { animal_name: 'asc' },
        select: { animal_name: true },
      });

      // Filter empty strings manually or use where NOT if schema allows
      // Prisma: not: ''
      const names = result
        .map((r) => r.animal_name)
        .filter((n) => n !== null && n !== '');

      return names as string[];
    } catch (error) {
      console.error(
        'Error in CattleMilkService.findAnimalNamesByCattleId:',
        error,
      );
      throw new InternalServerErrorException('Could not fetch animal names.');
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.cattle_milk.deleteMany({});
      return { message: `Cattle milk table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
