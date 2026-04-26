import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, floriculture } from '@prisma/client';

@Injectable()
export class FloricultureService {
  constructor(private prisma: PrismaService) {}

  async create(data: Partial<floriculture>): Promise<floriculture> {
    return this.prisma.floriculture.create({
      data: {
        user_id: data.user_id as number,
        flower_name: data.flower_name as string,
        flower_type: data.flower_type as string,
        area: data.area as number,
        method: data.method as string,
        planting_date: data.planting_date ? new Date(data.planting_date) : null,
      },
    });
  }

  async findByUser(userId: number): Promise<{ floricultures: floriculture[] }> {
    const flowers = await this.prisma.floriculture.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return { floricultures: flowers };
  }

  async update(id: number, data: Partial<floriculture>): Promise<floriculture> {
    const updateData: Prisma.floricultureUpdateInput = {};
    if (data.flower_name !== undefined)
      updateData.flower_name = data.flower_name;
    if (data.flower_type !== undefined)
      updateData.flower_type = data.flower_type;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.method !== undefined) updateData.method = data.method;
    if (data.planting_date !== undefined)
      updateData.planting_date = data.planting_date
        ? new Date(data.planting_date)
        : null;

    return this.prisma.floriculture.update({
      where: { flower_id: id },
      data: updateData,
    });
  }

  async remove(id: number): Promise<floriculture> {
    return this.prisma.floriculture.delete({
      where: { flower_id: id },
    });
  }

  async reset(userId: number): Promise<Prisma.BatchPayload> {
    return this.prisma.floriculture.deleteMany({
      where: { user_id: userId },
    });
  }
}
