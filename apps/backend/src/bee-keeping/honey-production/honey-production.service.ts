import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateHoneyProductionDto,
  UpdateHoneyProductionDto,
} from './honey-production.dto';
import { Prisma, honey_production } from '@prisma/client';

@Injectable()
export class HoneyProductionService {
  constructor(private readonly prisma: PrismaService) {}
  async findByHiveId(hiveId: number): Promise<honey_production[]> {
    try {
      const harvest = await this.prisma.honey_production.findMany({
        where: { hive_id: hiveId },
        orderBy: { harvest_date: 'desc' },
      });
      return harvest;
    } catch (error) {
      console.error('Error in HoneyProductionService.findByHiveId:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findById(harvestId: number): Promise<honey_production> {
    const harvest = await this.prisma.honey_production.findUnique({
      where: { harvest_id: harvestId },
    });
    if (!harvest) {
      throw new NotFoundException(`Harvest with ID ${harvestId} not found`);
    }
    return harvest;
  }

  async create(createDto: CreateHoneyProductionDto): Promise<honey_production> {
    if (!createDto || Object.keys(createDto).length === 0) {
      throw new BadRequestException('Request body cannot be empty.');
    }

    const {
      hive_id,
      harvest_date,
      honey_weight,
      frames_harvested,
      honey_type,
      harvest_notes,
    } = createDto;

    try {
      const newHarvest = await this.prisma.honey_production.create({
        data: {
          hive_id,
          harvest_date: harvest_date ? new Date(harvest_date) : new Date(),
          honey_weight,
          frames_harvested,
          honey_type,
          harvest_notes,
        },
      });
      return newHarvest;
    } catch (error) {
      console.error('Error in HoneyProductionService.create:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdateHoneyProductionDto,
  ): Promise<honey_production> {
    try {
      const updateData: Prisma.honey_productionUpdateInput = {};
      if (updateDto.harvest_date !== undefined)
        updateData.harvest_date = new Date(updateDto.harvest_date);
      if (updateDto.honey_weight !== undefined)
        updateData.honey_weight = updateDto.honey_weight;
      if (updateDto.frames_harvested !== undefined)
        updateData.frames_harvested = updateDto.frames_harvested;
      if (updateDto.honey_type !== undefined)
        updateData.honey_type = updateDto.honey_type;
      if (updateDto.harvest_notes !== undefined)
        updateData.harvest_notes = updateDto.harvest_notes;

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedHarvest = await this.prisma.honey_production.update({
        where: { harvest_id: id },
        data: updateData,
      });

      return updatedHarvest;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Harvest with ID ${id} not found`);
      }
      console.error('Error in HoneyProductionService.update:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.honey_production.delete({ where: { harvest_id: id } });
      return true;
    } catch {
      return false;
    }
  }

  async resetTable(): Promise<{ message: string }> {
    try {
      await this.prisma.honey_production.deleteMany({});
      return { message: 'Honey Production table has been reset' };
    } catch {
      throw new InternalServerErrorException(
        'Failed to reset honey production table',
      );
    }
  }
}
