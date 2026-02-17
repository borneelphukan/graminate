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

@Injectable()
export class HoneyProductionService {
  constructor(private readonly prisma: PrismaService) {}
  async findByHiveId(hiveId: number): Promise<any[]> {
    try {
      const harvest = await this.prisma.honey_production.findMany({
        where: { hive_id: hiveId },
        orderBy: { harvest_date: 'desc' },
      });
      return harvest;
    } catch (error) {
       console.error('Error in HoneyProductionService.findByHiveId:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(harvestId: number): Promise<any> {
    const harvest = await this.prisma.honey_production.findUnique({
      where: { harvest_id: harvestId },
    });
    if (!harvest) {
      throw new NotFoundException(`Harvest with ID ${harvestId} not found`);
    }
    return harvest;
  }

  async create(createDto: CreateHoneyProductionDto): Promise<any> {
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
        }
      });
      return newHarvest;
    } catch (error) {
      console.error('Error in HoneyProductionService.create:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateDto: UpdateHoneyProductionDto): Promise<any> {
    try {
      const updateData: any = {};
      Object.entries(updateDto).forEach(([key, value]) => {
        if (value !== undefined) {
             if (key === 'harvest_date') {
                 updateData[key] = new Date(value as string);
             } else {
                 updateData[key] = value;
             }
        }
      });

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedHarvest = await this.prisma.honey_production.update({
        where: { harvest_id: id },
        data: updateData,
      });

      return updatedHarvest;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Harvest with ID ${id} not found`);
      }
      console.error('Error in HoneyProductionService.update:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
        await this.prisma.honey_production.delete({ where: { harvest_id: id } });
        return true;
    } catch (error) {
        return false;
    }
  }

  async resetTable(): Promise<{ message: string }> {
    try {
      await this.prisma.honey_production.deleteMany({});
      return { message: 'Honey Production table has been reset' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
