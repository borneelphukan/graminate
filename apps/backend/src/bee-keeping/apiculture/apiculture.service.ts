import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateApiaryDto, UpdateApiaryDto } from './apiculture.dto';
import { Prisma, apiculture } from '@prisma/client';

export interface ApicultureWithCount extends apiculture {
  number_of_hives: number;
}

@Injectable()
export class ApicultureService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number): Promise<ApicultureWithCount[]> {
    try {
      const apiaries = await this.prisma.apiculture.findMany({
        where: { user_id: userId },
        include: {
          _count: {
            select: { bee_hives: true },
          },
        },
        orderBy: [{ created_at: 'desc' }, { apiary_id: 'desc' }],
      });

      return apiaries.map((apiary) => ({
        ...apiary,
        number_of_hives: apiary._count.bee_hives,
      }));
    } catch (error) {
      console.error('Error in ApicultureService.findByUserId:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findById(apiaryId: number): Promise<ApicultureWithCount | null> {
    try {
      const apiary = await this.prisma.apiculture.findUnique({
        where: { apiary_id: apiaryId },
        include: {
          _count: {
            select: { bee_hives: true },
          },
        },
      });

      if (!apiary) return null;

      return {
        ...apiary,
        number_of_hives: apiary._count.bee_hives,
      };
    } catch (error) {
      console.error('Error in ApicultureService.findById:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async create(createDto: CreateApiaryDto): Promise<ApicultureWithCount> {
    const {
      user_id,
      apiary_name,
      area,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
    } = createDto;
    try {
      const newApiary = await this.prisma.apiculture.create({
        data: {
          user_id,
          apiary_name,
          area,
          address_line_1,
          address_line_2,
          city,
          state,
          postal_code,
        },
      });
      return { ...newApiary, number_of_hives: 0 };
    } catch (error) {
      console.error('Error in ApicultureService.create:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdateApiaryDto,
  ): Promise<ApicultureWithCount | null> {
    try {
      const updateData: Prisma.apicultureUpdateInput = {};
      if (updateDto.apiary_name !== undefined)
        updateData.apiary_name = updateDto.apiary_name;
      if (updateDto.area !== undefined) updateData.area = updateDto.area;
      if (updateDto.address_line_1 !== undefined)
        updateData.address_line_1 = updateDto.address_line_1;
      if (updateDto.address_line_2 !== undefined)
        updateData.address_line_2 = updateDto.address_line_2;
      if (updateDto.city !== undefined) updateData.city = updateDto.city;
      if (updateDto.state !== undefined) updateData.state = updateDto.state;
      if (updateDto.postal_code !== undefined)
        updateData.postal_code = updateDto.postal_code;

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedApiary = await this.prisma.apiculture.update({
        where: { apiary_id: id },
        data: updateData,
        include: {
          _count: {
            select: { bee_hives: true },
          },
        },
      });

      return {
        ...updatedApiary,
        number_of_hives: updatedApiary._count.bee_hives,
      };
    } catch (error) {
      console.error('Error in ApicultureService.update:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.apiculture.delete({ where: { apiary_id: id } });
      return true;
    } catch (error) {
      console.error('Error in ApicultureService.delete:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async resetForUser(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.apiculture.deleteMany({ where: { user_id: userId } });
      return { message: `Apiculture data reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async resetTable(): Promise<{ message: string }> {
    try {
      await this.prisma.apiculture.deleteMany({});
      return { message: 'Apiculture table has been completely reset.' };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
