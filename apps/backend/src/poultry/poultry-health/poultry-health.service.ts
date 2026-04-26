import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreatePoultryHealthDto,
  UpdatePoultryHealthDto,
} from './poultry-health.dto';
import { Prisma, poultry_health } from '@prisma/client';

interface PoultryHealthFilters {
  limit?: number;
  offset?: number;
  flockId?: number;
}

@Injectable()
export class PoultryHealthService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdWithFilters(
    userId: number,
    filters: PoultryHealthFilters,
  ): Promise<poultry_health[]> {
    const { limit, offset, flockId } = filters;

    try {
      const where: Prisma.poultry_healthWhereInput = { user_id: userId };
      if (flockId !== undefined) where.flock_id = flockId;

      const records = await this.prisma.poultry_health.findMany({
        where,
        orderBy: [{ created_at: 'desc' }, { poultry_health_id: 'desc' }],
        take: limit,
        skip: offset,
      });

      return records;
    } catch (error) {
      console.error(
        'Error executing query in findByUserIdWithFilters (PoultryHealth):',
        error,
      );
      throw new InternalServerErrorException(
        `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<poultry_health | null> {
    try {
      const record = await this.prisma.poultry_health.findUnique({
        where: { poultry_health_id: id },
      });
      return record || null;
    } catch (error) {
      console.error(
        'Error executing query in findById (PoultryHealth):',
        error,
      );
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async create(createDto: CreatePoultryHealthDto): Promise<poultry_health> {
    const {
      user_id,
      flock_id,
      veterinary_name,
      total_birds,
      birds_vaccinated,
      vaccines_given,
      symptoms,
      medicine_approved,
      remarks,
      next_appointment,
    } = createDto;
    try {
      const newRecord = await this.prisma.poultry_health.create({
        data: {
          user_id,
          flock_id,
          veterinary_name,
          total_birds,
          birds_vaccinated,
          vaccines_given,
          symptoms,
          medicine_approved,
          remarks,
          next_appointment: next_appointment
            ? new Date(next_appointment)
            : null,
        },
      });
      return newRecord;
    } catch (error) {
      console.error('Error executing query in create (PoultryHealth):', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdatePoultryHealthDto,
  ): Promise<poultry_health | null> {
    const {
      veterinary_name,
      total_birds,
      birds_vaccinated,
      vaccines_given,
      symptoms,
      medicine_approved,
      remarks,
      next_appointment,
    } = updateDto;
    try {
      const updateData: Prisma.poultry_healthUpdateInput = {};
      if (veterinary_name !== undefined)
        updateData.veterinary_name = veterinary_name;
      if (total_birds !== undefined) updateData.total_birds = total_birds;
      if (birds_vaccinated !== undefined)
        updateData.birds_vaccinated = birds_vaccinated;
      if (vaccines_given !== undefined)
        updateData.vaccines_given = vaccines_given;
      if (symptoms !== undefined) updateData.symptoms = symptoms;
      if (medicine_approved !== undefined)
        updateData.medicine_approved = medicine_approved;
      if (remarks !== undefined) updateData.remarks = remarks;
      if (next_appointment !== undefined)
        updateData.next_appointment = next_appointment
          ? new Date(next_appointment)
          : null;

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedRecord = await this.prisma.poultry_health.update({
        where: { poultry_health_id: id },
        data: updateData,
      });

      return updatedRecord;
    } catch (error) {
      console.error('Error executing query in update (PoultryHealth):', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.poultry_health.delete({
        where: { poultry_health_id: id },
      });
      return true;
    } catch (error) {
      console.error('Error executing query in delete (PoultryHealth):', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.poultry_health.deleteMany({});
      return { message: `Poultry Health table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
