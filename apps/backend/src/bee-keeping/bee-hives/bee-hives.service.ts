import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateHiveDto, UpdateHiveDto } from './bee-hives.dto';
import { Prisma, bee_hives } from '@prisma/client';

export interface HiveWithInspection extends bee_hives {
  last_inspection_id: number | null;
  last_inspection_date: Date | null;
  queen_status: string | null;
  queen_introduced_date: Date | null;
  brood_pattern: string | null;
  symptoms: string[] | null;
  last_inspection_notes?: string | null;
}

@Injectable()
export class BeeHivesService {
  constructor(private readonly prisma: PrismaService) {}
  async findByApiaryId(apiaryId: number): Promise<HiveWithInspection[]> {
    try {
      const hives = await this.prisma.bee_hives.findMany({
        where: { apiary_id: apiaryId },
        include: {
          hive_inspection: {
            orderBy: [{ inspection_date: 'desc' }, { inspection_id: 'desc' }],
            take: 1,
          },
        },
        orderBy: { hive_name: 'asc' },
      });

      return hives.map((hive) => {
        const lastInspection = hive.hive_inspection[0];
        const { hive_inspection: _unused, ...rest } = hive;
        void _unused;
        return {
          ...rest,
          last_inspection_id: lastInspection?.inspection_id || null,
          last_inspection_date: lastInspection?.inspection_date || null,
          queen_status: lastInspection?.queen_status || null,
          queen_introduced_date: lastInspection?.queen_introduced_date || null,
          brood_pattern: lastInspection?.brood_pattern || null,
          symptoms: lastInspection?.symptoms || null,
        } as HiveWithInspection;
      });
    } catch (error) {
      console.error('Error in BeeHivesService.findByApiaryId:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findById(hiveId: number): Promise<HiveWithInspection> {
    try {
      const hive = await this.prisma.bee_hives.findUnique({
        where: { hive_id: hiveId },
        include: {
          hive_inspection: {
            orderBy: [{ inspection_date: 'desc' }, { inspection_id: 'desc' }],
            take: 1,
          },
        },
      });

      if (!hive) {
        throw new NotFoundException(`Hive with ID ${hiveId} not found`);
      }

      const lastInspection = hive.hive_inspection[0];
      const { hive_inspection: _unused, ...rest } = hive;
      void _unused;

      return {
        ...rest,
        last_inspection_id: lastInspection?.inspection_id || null,
        last_inspection_date: lastInspection?.inspection_date || null,
        queen_status: lastInspection?.queen_status || null,
        queen_introduced_date: lastInspection?.queen_introduced_date || null,
        brood_pattern: lastInspection?.brood_pattern || null,
        last_inspection_notes: lastInspection?.notes || null,
        symptoms: lastInspection?.symptoms || null,
      } as HiveWithInspection;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error in BeeHivesService.findById:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async create(createDto: CreateHiveDto): Promise<bee_hives> {
    const {
      apiary_id,
      hive_name,
      hive_type,
      bee_species,
      installation_date,
      honey_capacity,
      unit,
      ventilation_status,
      notes,
    } = createDto;
    try {
      const newHive = await this.prisma.bee_hives.create({
        data: {
          apiary_id,
          hive_name,
          hive_type,
          bee_species,
          installation_date: installation_date
            ? new Date(installation_date as string | number | Date)
            : new Date(),
          honey_capacity,
          unit,
          ventilation_status,
          notes,
        },
      });
      return newHive;
    } catch (error) {
      console.error('Error in BeeHivesService.create:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(id: number, updateDto: UpdateHiveDto): Promise<bee_hives> {
    try {
      const updateData: Prisma.bee_hivesUpdateInput = {};
      if (updateDto.hive_name !== undefined)
        updateData.hive_name = updateDto.hive_name;
      if (updateDto.hive_type !== undefined)
        updateData.hive_type = updateDto.hive_type;
      if (updateDto.bee_species !== undefined)
        updateData.bee_species = updateDto.bee_species;
      if (updateDto.installation_date !== undefined)
        updateData.installation_date = new Date(
          updateDto.installation_date as string | number | Date,
        );
      if (updateDto.honey_capacity !== undefined)
        updateData.honey_capacity = updateDto.honey_capacity;
      if (updateDto.unit !== undefined) updateData.unit = updateDto.unit;
      if (updateDto.ventilation_status !== undefined)
        updateData.ventilation_status = updateDto.ventilation_status;
      if (updateDto.notes !== undefined) updateData.notes = updateDto.notes;

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedHive = await this.prisma.bee_hives.update({
        where: { hive_id: id },
        data: updateData,
      });

      return updatedHive;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Hive with ID ${id} not found`);
      }
      console.error('Error in BeeHivesService.update:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.bee_hives.delete({ where: { hive_id: id } });
      return true;
    } catch {
      return false;
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.bee_hives.deleteMany({});
      return { message: `Bee Hives table reset for user ${userId}` };
    } catch {
      throw new InternalServerErrorException('Failed to reset bee hives table');
    }
  }
}
