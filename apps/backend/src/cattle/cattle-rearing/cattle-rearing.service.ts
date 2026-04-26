import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateCattleRearingDto,
  UpdateCattleRearingDto,
} from './cattle-rearing.dto';
import { Prisma, cattle_rearing } from '@prisma/client';

@Injectable()
export class CattleRearingService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number): Promise<cattle_rearing[]> {
    try {
      const records = await this.prisma.cattle_rearing.findMany({
        where: { user_id: userId },
        orderBy: [{ created_at: 'desc' }, { cattle_id: 'desc' }],
      });
      return records;
    } catch (error) {
      console.error('Error in CattleRearingService.findByUserId:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findById(cattleId: number): Promise<cattle_rearing> {
    try {
      const record = await this.prisma.cattle_rearing.findUnique({
        where: { cattle_id: cattleId },
      });
      if (!record) {
        throw new NotFoundException(
          `Cattle record with ID ${cattleId} not found`,
        );
      }
      return record;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error in CattleRearingService.findById:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async create(createDto: CreateCattleRearingDto): Promise<cattle_rearing> {
    const { user_id, cattle_name, cattle_type, number_of_animals, purpose } =
      createDto;
    try {
      const newRecord = await this.prisma.cattle_rearing.create({
        data: {
          user_id,
          cattle_name,
          cattle_type,
          number_of_animals,
          purpose,
        },
      });
      return newRecord;
    } catch (error) {
      console.error('Error in CattleRearingService.create:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdateCattleRearingDto,
  ): Promise<cattle_rearing> {
    const { cattle_name, cattle_type, number_of_animals, purpose } = updateDto;
    try {
      const updateData: Prisma.cattle_rearingUpdateInput = {};
      if (cattle_name !== undefined) updateData.cattle_name = cattle_name;
      if (cattle_type !== undefined) updateData.cattle_type = cattle_type;
      if (number_of_animals !== undefined)
        updateData.number_of_animals = number_of_animals;
      if (purpose !== undefined) updateData.purpose = purpose;

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedRecord = await this.prisma.cattle_rearing.update({
        where: { cattle_id: id },
        data: updateData,
      });

      return updatedRecord;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Cattle record with ID ${id} not found`);
      }
      console.error('Error in CattleRearingService.update:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.cattle_rearing.delete({ where: { cattle_id: id } });
      return true;
    } catch {
      return false;
    }
  }

  async resetForUser(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.cattle_rearing.deleteMany({
        where: { user_id: userId },
      });
      return { message: `Cattle Rearing data reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async resetTable(): Promise<{ message: string }> {
    try {
      await this.prisma.cattle_rearing.deleteMany({});
      return { message: 'Cattle Rearing table has been completely reset.' };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
