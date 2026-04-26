import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateCattleRearingDto,
  UpdateCattleRearingDto,
} from './cattle-rearing.dto';

@Injectable()
export class CattleRearingService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number): Promise<any[]> {
    try {
      const records = await this.prisma.cattle_rearing.findMany({
        where: { user_id: userId },
        orderBy: [{ created_at: 'desc' }, { cattle_id: 'desc' }],
      });
      return records;
    } catch (error) {
      console.error('Error in CattleRearingService.findByUserId:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(cattleId: number): Promise<any> {
    try {
      const record = await this.prisma.cattle_rearing.findUnique({
        where: { cattle_id: cattleId },
      });
      return record || null;
    } catch (error) {
      console.error('Error in CattleRearingService.findById:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createDto: CreateCattleRearingDto): Promise<any> {
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
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateDto: UpdateCattleRearingDto): Promise<any> {
    const { cattle_name, cattle_type, number_of_animals, purpose } = updateDto;
    try {
      const updateData: any = {};
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
      console.error('Error in CattleRearingService.update:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.cattle_rearing.delete({ where: { cattle_id: id } });
      return true;
    } catch (error) {
      console.error('Error in CattleRearingService.delete:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetForUser(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.cattle_rearing.deleteMany({
        where: { user_id: userId },
      });
      return { message: `Cattle Rearing data reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetTable(): Promise<{ message: string }> {
    try {
      await this.prisma.cattle_rearing.deleteMany({});
      return { message: 'Cattle Rearing table has been completely reset.' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
