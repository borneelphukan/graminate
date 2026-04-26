import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePoultryEggDto, UpdatePoultryEggDto } from './poultry-eggs.dto';
import { Prisma, poultry_eggs } from '@prisma/client';

interface PoultryEggFilters {
  limit?: number;
  offset?: number;
  flockId?: number;
}

@Injectable()
export class PoultryEggsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdWithFilters(
    userId: number,
    filters: PoultryEggFilters,
  ): Promise<poultry_eggs[]> {
    const { limit, offset, flockId } = filters;

    try {
      const where: Prisma.poultry_eggsWhereInput = { user_id: userId };
      if (flockId !== undefined) where.flock_id = flockId;

      const eggs = await this.prisma.poultry_eggs.findMany({
        where,
        orderBy: [{ date_logged: 'desc' }, { egg_id: 'desc' }],
        take: limit,
        skip: offset,
      });

      return eggs;
    } catch (error) {
      console.error(
        'Error executing query in findByUserIdWithFilters (PoultryEggs):',
        error,
      );
      throw new InternalServerErrorException(
        `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<poultry_eggs | null> {
    try {
      const egg = await this.prisma.poultry_eggs.findUnique({
        where: { egg_id: id },
      });
      return egg || null;
    } catch (error) {
      console.error('Error executing query in findById (PoultryEggs):', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async create(createDto: CreatePoultryEggDto): Promise<poultry_eggs> {
    const {
      user_id,
      flock_id,
      date_collected,
      small_eggs = 0,
      medium_eggs = 0,
      large_eggs = 0,
      extra_large_eggs = 0,
      broken_eggs = 0,
    } = createDto;

    const total_eggs = small_eggs + medium_eggs + large_eggs + extra_large_eggs;

    try {
      const newEgg = await this.prisma.poultry_eggs.create({
        data: {
          user_id,
          flock_id,
          date_collected: new Date(date_collected),
          small_eggs,
          medium_eggs,
          large_eggs,
          extra_large_eggs,
          total_eggs,
          broken_eggs,
        },
      });
      return newEgg;
    } catch (error) {
      console.error('Error executing query in create (PoultryEggs):', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdatePoultryEggDto,
  ): Promise<poultry_eggs | null> {
    const {
      date_collected,
      small_eggs,
      medium_eggs,
      large_eggs,
      extra_large_eggs,
      broken_eggs,
    } = updateDto || {};

    try {
      const updateData: Prisma.poultry_eggsUpdateInput = {};
      if (date_collected !== undefined)
        updateData.date_collected = new Date(date_collected);
      if (small_eggs !== undefined) updateData.small_eggs = small_eggs;
      if (medium_eggs !== undefined) updateData.medium_eggs = medium_eggs;
      if (large_eggs !== undefined) updateData.large_eggs = large_eggs;
      if (extra_large_eggs !== undefined)
        updateData.extra_large_eggs = extra_large_eggs;
      if (broken_eggs !== undefined) updateData.broken_eggs = broken_eggs;

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const hasEggCountChange = [
        small_eggs,
        medium_eggs,
        large_eggs,
        extra_large_eggs,
      ].some((val) => val !== undefined);

      if (hasEggCountChange) {
        const currentRecord = await this.findById(id);
        if (!currentRecord) {
          return null;
        }

        const newTotalEggs =
          (small_eggs !== undefined ? small_eggs : currentRecord.small_eggs) +
          (medium_eggs !== undefined
            ? medium_eggs
            : currentRecord.medium_eggs) +
          (large_eggs !== undefined ? large_eggs : currentRecord.large_eggs) +
          (extra_large_eggs !== undefined
            ? extra_large_eggs
            : currentRecord.extra_large_eggs);

        updateData.total_eggs = newTotalEggs;
      }

      const updatedEgg = await this.prisma.poultry_eggs.update({
        where: { egg_id: id },
        data: updateData,
      });

      return updatedEgg;
    } catch (error) {
      console.error('Error executing query in update (PoultryEggs):', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.poultry_eggs.delete({ where: { egg_id: id } });
      return true;
    } catch (error) {
      console.error('Error executing query in delete (PoultryEggs):', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.poultry_eggs.deleteMany({});
      return { message: `Poultry Eggs table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
