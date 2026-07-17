import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
  BadRequestException,
  UnauthorizedException,
  Request,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { ExpensesService } from './expenses.service';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  DeleteExpensesByOccupationDto,
} from './expenses.dto';
import { expenses } from '@prisma/client';
import { expensesSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ): Promise<{ expenses: expenses[] }> {
    if (String(req.user.userId) !== String(userId)) {
      throw new UnauthorizedException('Access denied');
    }
    const expensesList = await this.expensesService.findByUserId(userId);
    return { expenses: expensesList };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<expenses> {
    return this.expensesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(expensesSchema)
  @Post('add')
  async addExpense(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createDto: CreateExpenseDto,
    @Request() req: RequestWithUser,
  ): Promise<expenses> {
    try {
      createDto.user_id = req.user.userId!;
      return await this.expensesService.create(createDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(error.getResponse(), HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  async updateExpense(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateDto: UpdateExpenseDto,
    @Request() req: RequestWithUser,
  ): Promise<expenses> {
    try {
      const updatedExpense = await this.expensesService.update(id, updateDto, req.user.userId!);
      return updatedExpense;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(error.getResponse(), HttpStatus.BAD_REQUEST);
      }
      if (
        error instanceof HttpException &&
        error.getStatus() === (HttpStatus.NOT_FOUND as number)
      ) {
        throw error;
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteExpense(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const deleted = await this.expensesService.delete(id, req.user.userId!);
    if (!deleted) {
      throw new HttpException(
        'Expense not found or could not be deleted',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Expense deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async reset(@Request() req: RequestWithUser): Promise<{ message: string }> {
    return this.expensesService.resetTable(req.user.userId!);
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-by-occupation')
  async deleteByOccupation(
    @Body(new ValidationPipe()) deleteDto: DeleteExpensesByOccupationDto,
  ): Promise<{ message: string; deletedCount: number }> {
    return this.expensesService.deleteByOccupationAndUser(
      deleteDto.userId,
      deleteDto.occupation,
    );
  }
}
