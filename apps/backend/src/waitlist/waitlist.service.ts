import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaitlistService {
  constructor(private prisma: PrismaService) {}

  async addToWaitlist(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
  }) {
    try {
      return await this.prisma.waitlist.create({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          role: data.role,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Email already in waitlist');
      }
      throw e;
    }
  }

  async getWaitlist() {
    return this.prisma.waitlist.findMany({
      orderBy: {
        joined_at: 'desc',
      },
    });
  }
}
