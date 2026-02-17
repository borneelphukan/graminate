import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateHiveDto, UpdateHiveDto } from './bee-hives.dto';

@Injectable()
export class BeeHivesService {
  constructor(private readonly prisma: PrismaService) {}
  async findByApiaryId(apiaryId: number): Promise<any[]> {
    try {
      const hives = await this.prisma.bee_hives.findMany({
        where: { apiary_id: apiaryId },
        include: {
          hive_inspection: {
            orderBy: [
              { inspection_date: 'desc' },
              { inspection_id: 'desc' },
            ],
            take: 1,
          },
        },
        orderBy: { hive_name: 'asc' },
      });

      return hives.map((hive) => {
        const lastInspection = hive.hive_inspection[0];
        // Remove the array from the object to match original structure style
        const { hive_inspection, ...rest } = hive;
        return {
          ...rest,
          last_inspection_id: lastInspection?.inspection_id || null,
          last_inspection_date: lastInspection?.inspection_date || null,
          queen_status: lastInspection?.queen_status || null,
          queen_introduced_date: lastInspection?.queen_introduced_date || null,
          brood_pattern: lastInspection?.brood_pattern || null,
          symptoms: lastInspection?.symptoms || null,
        };
      });
    } catch (error) {
      console.error('Error in BeeHivesService.findByApiaryId:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(hiveId: number): Promise<any> {
    try {
        const hive = await this.prisma.bee_hives.findUnique({
            where: { hive_id: hiveId },
            include: {
            hive_inspection: {
                orderBy: [
                { inspection_date: 'desc' },
                { inspection_id: 'desc' },
                ],
                take: 1,
            },
            },
        });

        if (!hive) {
            throw new NotFoundException(`Hive with ID ${hiveId} not found`);
        }

        const lastInspection = hive.hive_inspection[0];
        const { hive_inspection, ...rest } = hive;
        
        return {
            ...rest,
            last_inspection_id: lastInspection?.inspection_id || null,
            last_inspection_date: lastInspection?.inspection_date || null,
            queen_status: lastInspection?.queen_status || null,
            queen_introduced_date: lastInspection?.queen_introduced_date || null,
            brood_pattern: lastInspection?.brood_pattern || null,
            last_inspection_notes: lastInspection?.notes || null, // notes mapped to last_inspection_notes
            symptoms: lastInspection?.symptoms || null,
        };
    } catch (error) {
        if (error instanceof NotFoundException) throw error;
        console.error('Error in BeeHivesService.findById:', error);
        throw new InternalServerErrorException(error.message);
    }
  }

  async create(createDto: CreateHiveDto): Promise<any> {
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
          installation_date: installation_date ? new Date(installation_date as string | number | Date) : new Date(),
          honey_capacity,
          unit,
          ventilation_status,
          notes,
        }
      });
      return newHive;
    } catch (error) {
      console.error('Error in BeeHivesService.create:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateDto: UpdateHiveDto): Promise<any> {
    try {
      const updateData: any = {};
      Object.entries(updateDto).forEach(([key, value]) => {
        if (value !== undefined) {
             if (key === 'installation_date') {
                 updateData[key] = new Date(value as string);
             } else {
                 updateData[key] = value;
             }
        }
      });

      if (Object.keys(updateData).length === 0) {
        return this.findById(id);
      }

      const updatedHive = await this.prisma.bee_hives.update({
        where: { hive_id: id },
        data: updateData,
      });

      return updatedHive;

    } catch (error) {
      if (error.code === 'P2025') { // Prisma record not found
         throw new NotFoundException(`Hive with ID ${id} not found`);
      }
      console.error('Error in BeeHivesService.update:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
        await this.prisma.bee_hives.delete({ where: { hive_id: id } });
        return true;
    } catch (error) {
        return false; 
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.bee_hives.deleteMany({});
      return { message: `Bee Hives table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
