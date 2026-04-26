import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateFlockDto, UpdateFlockDto } from './flock.dto';
import { Prisma, poultry_flock } from '@prisma/client';

@Injectable()
export class FlockService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number): Promise<poultry_flock[]> {
    try {
      const flocks = await this.prisma.poultry_flock.findMany({
        where: { user_id: userId },
        orderBy: [{ created_at: 'desc' }, { flock_id: 'desc' }],
      });
      return flocks;
    } catch (error) {
      console.error('Error in FlockService.findByUserId:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findById(flockId: number): Promise<poultry_flock | null> {
    try {
      const flock = await this.prisma.poultry_flock.findUnique({
        where: { flock_id: Number(flockId) },
      });
      return flock || null;
    } catch (error) {
      console.error('Error in FlockService.findById:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async create(createDto: CreateFlockDto): Promise<poultry_flock> {
    const {
      user_id,
      flock_name,
      flock_type,
      quantity,
      breed,
      source,
      housing_type,
      notes,
    } = createDto;
    try {
      const newFlock = await this.prisma.poultry_flock.create({
        data: {
          user_id,
          flock_name,
          flock_type,
          quantity,
          breed,
          source,
          housing_type,
          notes,
        },
      });
      return newFlock;
    } catch (error) {
      console.error('Error in FlockService.create:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdateFlockDto,
  ): Promise<poultry_flock | null> {
    const {
      flock_name,
      flock_type,
      quantity,
      breed,
      source,
      housing_type,
      notes,
    } = updateDto;
    try {
      const updateData: Prisma.poultry_flockUpdateInput = {};
      if (flock_name !== undefined) updateData.flock_name = flock_name;
      if (flock_type !== undefined) updateData.flock_type = flock_type;
      if (quantity !== undefined) updateData.quantity = quantity;
      if (breed !== undefined) updateData.breed = breed;
      if (source !== undefined) updateData.source = source;
      if (housing_type !== undefined) updateData.housing_type = housing_type;
      if (notes !== undefined) updateData.notes = notes;

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedFlock = await this.prisma.poultry_flock.update({
        where: { flock_id: id },
        data: updateData,
      });

      return updatedFlock;
    } catch (error) {
      console.error('Error in FlockService.update:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.poultry_flock.delete({ where: { flock_id: id } });
      return true;
    } catch (error) {
      console.error('Error in FlockService.delete:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async resetTable(): Promise<{ message: string }> {
    try {
      await this.prisma.poultry_flock.deleteMany({});
      return { message: 'Poultry flock table has been completely reset.' };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async resetForUser(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.poultry_flock.deleteMany({
        where: { user_id: userId },
      });
      return { message: `Poultry flock data reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
