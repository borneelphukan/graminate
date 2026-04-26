import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateInspectionDto,
  UpdateInspectionDto,
} from './hive-inspection.dto';
import { Prisma, hive_inspection } from '@prisma/client';

@Injectable()
export class HiveInspectionService {
  constructor(private readonly prisma: PrismaService) {}
  async findByHiveId(hiveId: number): Promise<hive_inspection[]> {
    try {
      const inspections = await this.prisma.hive_inspection.findMany({
        where: { hive_id: hiveId },
        orderBy: { inspection_date: 'desc' },
      });
      return inspections;
    } catch (error) {
      console.error('Error in HiveInspectionService.findByHiveId:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findById(inspectionId: number): Promise<hive_inspection> {
    const inspection = await this.prisma.hive_inspection.findUnique({
      where: { inspection_id: inspectionId },
    });

    if (!inspection) {
      throw new NotFoundException(
        `Inspection with ID ${inspectionId} not found`,
      );
    }
    return inspection;
  }

  async create(createDto: CreateInspectionDto): Promise<hive_inspection> {
    if (!createDto || Object.keys(createDto).length === 0) {
      throw new BadRequestException('Request body cannot be empty.');
    }

    const {
      hive_id,
      inspection_date,
      queen_status,
      queen_introduced_date,
      brood_pattern,
      notes,
      symptoms,
      population_strength,
      frames_of_brood,
      frames_of_nectar_honey,
      frames_of_pollen,
      room_to_lay,
      queen_cells_observed,
      queen_cells_count,
      varroa_mite_method,
      varroa_mite_count,
      actions_taken,
    } = createDto;

    try {
      const newInspection = await this.prisma.hive_inspection.create({
        data: {
          hive_id,
          inspection_date: new Date(inspection_date),
          queen_status: queen_status || null,
          queen_introduced_date: queen_introduced_date
            ? new Date(queen_introduced_date)
            : null,
          brood_pattern: brood_pattern || null,
          notes: notes || null,
          symptoms: symptoms || [],
          population_strength: population_strength || null,
          frames_of_brood: frames_of_brood || null,
          frames_of_nectar_honey: frames_of_nectar_honey || null,
          frames_of_pollen: frames_of_pollen || null,
          room_to_lay: room_to_lay || null,
          queen_cells_observed: queen_cells_observed || null,
          queen_cells_count: queen_cells_count || null,
          varroa_mite_method: varroa_mite_method || null,
          varroa_mite_count: varroa_mite_count || null,
          actions_taken: actions_taken || null,
        },
      });
      return newInspection;
    } catch (error) {
      console.error('Error in HiveInspectionService.create:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdateInspectionDto,
  ): Promise<hive_inspection> {
    try {
      const updateData: Prisma.hive_inspectionUpdateInput = {};
      if (updateDto.inspection_date !== undefined)
        updateData.inspection_date = new Date(updateDto.inspection_date);
      if (updateDto.queen_status !== undefined)
        updateData.queen_status = updateDto.queen_status;
      if (updateDto.queen_introduced_date !== undefined)
        updateData.queen_introduced_date = updateDto.queen_introduced_date
          ? new Date(updateDto.queen_introduced_date)
          : null;
      if (updateDto.brood_pattern !== undefined)
        updateData.brood_pattern = updateDto.brood_pattern;
      if (updateDto.notes !== undefined) updateData.notes = updateDto.notes;
      if (updateDto.symptoms !== undefined)
        updateData.symptoms = updateDto.symptoms;
      if (updateDto.population_strength !== undefined)
        updateData.population_strength = updateDto.population_strength;
      if (updateDto.frames_of_brood !== undefined)
        updateData.frames_of_brood = updateDto.frames_of_brood;
      if (updateDto.frames_of_nectar_honey !== undefined)
        updateData.frames_of_nectar_honey = updateDto.frames_of_nectar_honey;
      if (updateDto.frames_of_pollen !== undefined)
        updateData.frames_of_pollen = updateDto.frames_of_pollen;
      if (updateDto.room_to_lay !== undefined)
        updateData.room_to_lay = updateDto.room_to_lay;
      if (updateDto.queen_cells_observed !== undefined)
        updateData.queen_cells_observed = updateDto.queen_cells_observed;
      if (updateDto.queen_cells_count !== undefined)
        updateData.queen_cells_count = updateDto.queen_cells_count;
      if (updateDto.varroa_mite_method !== undefined)
        updateData.varroa_mite_method = updateDto.varroa_mite_method;
      if (updateDto.varroa_mite_count !== undefined)
        updateData.varroa_mite_count = updateDto.varroa_mite_count;
      if (updateDto.actions_taken !== undefined)
        updateData.actions_taken = updateDto.actions_taken;

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedInspection = await this.prisma.hive_inspection.update({
        where: { inspection_id: id },
        data: updateData,
      });

      return updatedInspection;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Inspection with ID ${id} not found`);
      }
      console.error('Error in HiveInspectionService.update:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.hive_inspection.delete({
        where: { inspection_id: id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async resetTable(): Promise<{ message: string }> {
    try {
      await this.prisma.hive_inspection.deleteMany({});
      return { message: 'Hive Inspections table has been reset' };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
