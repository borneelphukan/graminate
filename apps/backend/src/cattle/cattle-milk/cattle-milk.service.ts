import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCattleMilkDto, UpdateCattleMilkDto } from './cattle-milk.dto';
import { Prisma, cattle_milk } from '@prisma/client';

@Injectable()
export class CattleMilkService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number): Promise<cattle_milk[]> {
    try {
      const records = await this.prisma.cattle_milk.findMany({
        where: { user_id: userId },
        orderBy: [{ date_collected: 'desc' }, { milk_id: 'desc' }],
      });
      return records;
    } catch (error) {
      console.error('Error in CattleMilkService.findByUserId:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findByCattleId(cattleId: number): Promise<cattle_milk[]> {
    try {
      const records = await this.prisma.cattle_milk.findMany({
        where: { cattle_id: cattleId },
        orderBy: [{ date_collected: 'desc' }, { milk_id: 'desc' }],
      });
      return records;
    } catch (error) {
      console.error('Error in CattleMilkService.findByCattleId:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findById(milkId: number): Promise<cattle_milk> {
    try {
      const record = await this.prisma.cattle_milk.findUnique({
        where: { milk_id: milkId },
      });
      if (!record) {
        throw new NotFoundException(`Milk record with ID ${milkId} not found`);
      }
      return record;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error in CattleMilkService.findById:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async create(createDto: CreateCattleMilkDto): Promise<cattle_milk> {
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
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdateCattleMilkDto,
  ): Promise<cattle_milk> {
    const { date_collected, animal_name, milk_produced } = updateDto;

    try {
      const updateData: Prisma.cattle_milkUpdateInput = {};
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Milk record with ID ${id} not found`);
      }
      console.error('Error in CattleMilkService.update:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.cattle_milk.delete({ where: { milk_id: id } });
      return true;
    } catch {
      return false;
    }
  }

  async findAnimalNamesByCattleId(cattleId: number): Promise<string[]> {
    try {
      const result = await this.prisma.cattle_milk.findMany({
        where: {
          cattle_id: cattleId,
          animal_name: {
            not: null,
          },
        },
        distinct: ['animal_name'],
        orderBy: { animal_name: 'asc' },
        select: { animal_name: true },
      });

      const names = result
        .map((r) => r.animal_name)
        .filter((n): n is string => n !== null && n !== '');

      return names;
    } catch (error) {
      console.error(
        'Error in CattleMilkService.findAnimalNamesByCattleId:',
        error,
      );
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.cattle_milk.deleteMany({});
      return { message: `Cattle milk table reset for user ${userId}` };
    } catch {
      throw new InternalServerErrorException(
        'Failed to reset cattle milk table',
      );
    }
  }
}
