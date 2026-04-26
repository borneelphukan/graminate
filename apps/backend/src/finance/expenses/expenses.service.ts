import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: number): Promise<any[]> {
    try {
      const expenses = await this.prisma.expenses.findMany({
        where: { user_id: userId },
        orderBy: [
          { date_created: 'desc' },
          { created_at: 'desc' },
          { expense_id: 'desc' },
        ],
      });
      return expenses;
    } catch (error) {
      console.error('Error in ExpensesService.findByUserId:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(expenseId: number): Promise<any> {
    try {
      const expense = await this.prisma.expenses.findUnique({
        where: { expense_id: Number(expenseId) },
      });
      return expense || null;
    } catch (error) {
      console.error('Error in ExpensesService.findById:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createDto: CreateExpenseDto): Promise<any> {
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
      // Prisma error checking can be added here if needed
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateDto: UpdateExpenseDto): Promise<any> {
    const currentExpense = await this.findById(id);
    if (!currentExpense) {
      throw new NotFoundException(`Expense with ID ${id} not found.`);
    }

    try {
      const updateData: any = {};

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
      console.error('Error in ExpensesService.update:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.expenses.delete({ where: { expense_id: id } });
      return true;
    } catch (error) {
      console.error('Error in ExpensesService.delete:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.expenses.deleteMany({});
      return {
        message: `Expenses table reset initiated by user ${userId}`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to reset contracts table');
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
      throw new InternalServerErrorException(error.message);
    }
  }
}
