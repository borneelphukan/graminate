import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './expenses.dto';
import { Prisma, expenses } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number): Promise<expenses[]> {
    try {
      const expensesList = await this.prisma.expenses.findMany({
        where: { user_id: userId },
        orderBy: [
          { date_created: 'desc' },
          { created_at: 'desc' },
          { expense_id: 'desc' },
        ],
      });
      return expensesList;
    } catch (error) {
      console.error('Error in ExpensesService.findByUserId:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async findById(expenseId: number): Promise<expenses> {
    try {
      const expense = await this.prisma.expenses.findUnique({
        where: { expense_id: Number(expenseId) },
      });
      if (!expense) {
        throw new NotFoundException(`Expense with ID ${expenseId} not found.`);
      }
      return expense;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error in ExpensesService.findById:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async create(createDto: CreateExpenseDto): Promise<expenses> {
    const { user_id, title, occupation, category, expense, date_created } =
      createDto;

    try {
      const newExpense = await this.prisma.expenses.create({
        data: {
          user_id,
          title,
          occupation,
          category,
          expense,
          date_created: new Date(date_created),
        },
      });
      return newExpense;
    } catch (error) {
      console.error('Error in ExpensesService.create:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async update(id: number, updateDto: UpdateExpenseDto): Promise<expenses> {
    const currentExpense = await this.findById(id);

    try {
      const updateData: Prisma.expensesUpdateInput = {};

      if (updateDto.title !== undefined) updateData.title = updateDto.title;
      if (updateDto.occupation !== undefined)
        updateData.occupation = updateDto.occupation;
      if (updateDto.category !== undefined)
        updateData.category = updateDto.category;
      if (updateDto.expense !== undefined)
        updateData.expense = updateDto.expense;
      if (updateDto.date_created !== undefined)
        updateData.date_created = new Date(updateDto.date_created);

      if (Object.keys(updateData).length === 0) {
        return currentExpense;
      }

      const updatedExpense = await this.prisma.expenses.update({
        where: { expense_id: id },
        data: updateData,
      });

      return updatedExpense;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Expense with ID ${id} not found`);
      }
      console.error('Error in ExpensesService.update:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.expenses.delete({ where: { expense_id: id } });
      return true;
    } catch {
      return false;
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.expenses.deleteMany({});
      return {
        message: `Expenses table reset initiated by user ${userId}`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async deleteByOccupationAndUser(
    userId: number,
    occupation: string,
  ): Promise<{ message: string; deletedCount: number }> {
    try {
      const result = await this.prisma.expenses.deleteMany({
        where: { user_id: userId, occupation },
      });
      return {
        message: `Expenses for user ${userId} with occupation '${occupation}' deleted.`,
        deletedCount: result.count,
      };
    } catch (error) {
      console.error(
        'Error in ExpensesService.deleteByOccupationAndUser:',
        error,
      );
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
