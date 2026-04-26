import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateContractDto, UpdateContractDto } from './contracts.dto';
import { Prisma, deals } from '@prisma/client';

@Injectable()
export class ContractsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getContracts(
    userId?: number,
    page?: number,
    limit?: number,
  ): Promise<{
    status: number;
    data: { contracts?: deals[]; error?: string };
  }> {
    try {
      let contractsList: deals[];
      const where: Prisma.dealsWhereInput = {};
      if (userId !== undefined) {
        if (isNaN(userId) || userId <= 0) {
          return { status: 400, data: { error: 'Invalid User ID parameter' } };
        }
        where.user_id = userId;
      }

      if (limit && page) {
        const offset = (page - 1) * limit;
        contractsList = await this.prisma.deals.findMany({
          where,
          orderBy: { start_date: 'desc' },
          take: limit,
          skip: offset,
        });
      } else {
        contractsList = await this.prisma.deals.findMany({
          where,
          orderBy: { start_date: 'desc' },
        });
      }

      return { status: 200, data: { contracts: contractsList } };
    } catch (err) {
      console.error('Error fetching contracts:', err);
      return { status: 500, data: { error: 'Failed to fetch contracts' } };
    }
  }

  async addContract(createContractDto: CreateContractDto): Promise<{
    status: number;
    data: { message?: string; error?: string; contract?: deals };
  }> {
    const {
      user_id,
      deal_name,
      partner,
      amount,
      stage,
      start_date,
      end_date,
      category,
      priority,
    } = createContractDto;

    try {
      const newContract = await this.prisma.deals.create({
        data: {
          user_id,
          deal_name,
          partner,
          amount,
          stage,
          start_date: new Date(start_date),
          end_date: end_date ? new Date(end_date) : new Date(start_date),
          category: category || null,
          priority: priority || 'Medium',
        },
      });

      return {
        status: 201,
        data: {
          message: 'Contract added successfully',
          contract: newContract,
        },
      };
    } catch {
      return { status: 500, data: { error: 'Failed to add contract' } };
    }
  }

  async deleteContract(id: number): Promise<{
    status: number;
    data: { message?: string; error?: string; contract?: deals };
  }> {
    if (isNaN(id) || id <= 0) {
      return { status: 400, data: { error: 'Invalid contract (deal) ID' } };
    }

    try {
      const existing = await this.prisma.deals.findUnique({
        where: { deal_id: id },
      });

      if (!existing) {
        return { status: 404, data: { error: 'Contract not found' } };
      }

      const deletedContract = await this.prisma.deals.delete({
        where: { deal_id: id },
      });

      return {
        status: 200,
        data: {
          message: 'Contract deleted successfully',
          contract: deletedContract,
        },
      };
    } catch (err) {
      console.error('Error deleting contract:', err);
      return { status: 500, data: { error: 'Failed to delete contract' } };
    }
  }

  async updateContract(updateContractDto: UpdateContractDto): Promise<{
    status: number;
    data: { message?: string; error?: string; contract?: deals };
  }> {
    const {
      id,
      deal_name,
      partner,
      amount,
      stage,
      start_date,
      end_date,
      category,
      priority,
    } = updateContractDto;

    if (isNaN(id) || id <= 0) {
      return { status: 400, data: { error: 'Invalid contract (deal) ID' } };
    }

    const updateFields = [
      deal_name,
      partner,
      amount,
      stage,
      start_date,
      end_date,
      category,
      priority,
    ];
    if (updateFields.every((field) => field === undefined)) {
      return { status: 400, data: { error: 'No update data provided' } };
    }

    try {
      const existing = await this.prisma.deals.findUnique({
        where: { deal_id: id },
      });
      if (!existing) {
        return { status: 404, data: { error: 'Contract not found' } };
      }

      const updateData: Prisma.dealsUpdateInput = {};

      if (deal_name !== undefined) updateData.deal_name = deal_name;
      if (partner !== undefined) updateData.partner = partner;
      if (amount !== undefined) updateData.amount = amount;
      if (stage !== undefined) updateData.stage = stage;
      if (start_date !== undefined)
        updateData.start_date = new Date(start_date);
      if (end_date !== undefined)
        updateData.end_date = end_date ? new Date(end_date) : undefined;
      if (category !== undefined) updateData.category = category;
      if (priority !== undefined) updateData.priority = priority;

      const updatedContract = await this.prisma.deals.update({
        where: { deal_id: id },
        data: updateData,
      });

      return {
        status: 200,
        data: {
          message: 'Contract updated successfully',
          contract: updatedContract,
        },
      };
    } catch {
      return { status: 500, data: { error: 'Failed to update contract' } };
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.deals.deleteMany({});
      return {
        message: `Contracts (deals) table reset initiated by user ${userId}`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to reset contracts table',
      );
    }
  }
}
