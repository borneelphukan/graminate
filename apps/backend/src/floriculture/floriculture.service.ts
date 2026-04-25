import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FloricultureService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.floriculture.create({
      data: {
        user_id: data.user_id,
        flower_name: data.flower_name,
        flower_type: data.flower_type,
        area: data.area,
        method: data.method,
        planting_date: data.planting_date ? new Date(data.planting_date) : null,
      },
    });
  }

  async findByUser(userId: number) {
    const flowers = await this.prisma.floriculture.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return { floricultures: flowers };
  }

  async update(id: number, data: any) {
    return this.prisma.floriculture.update({
      where: { flower_id: id },
      data: {
        flower_name: data.flower_name,
        flower_type: data.flower_type,
        area: data.area,
        method: data.method,
        planting_date: data.planting_date ? new Date(data.planting_date) : null,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.floriculture.delete({
      where: { flower_id: id },
    });
  }

  async reset(userId: number) {
    return this.prisma.floriculture.deleteMany({
      where: { user_id: userId },
    });
  }
}
