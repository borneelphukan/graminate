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
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { SalesService } from './sales.service';
import {
  CreateSaleDto,
  UpdateSaleDto,
  DeleteSalesByOccupationDto,
  ResetSalesDto,
} from './sales.dto';
import { sales } from '@prisma/client';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ sales: sales[] }> {
    const salesList = await this.salesService.findByUserId(userId);
    return { sales: salesList };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<sales> {
    return this.salesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addSale(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createDto: CreateSaleDto,
  ): Promise<sales> {
    try {
      return await this.salesService.create(createDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(error.getResponse(), HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  async updateSale(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateDto: UpdateSaleDto,
  ): Promise<sales> {
    try {
      const updatedSale = await this.salesService.update(id, updateDto);
      return updatedSale;
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
  async deleteSale(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const deleted = await this.salesService.delete(id);
    if (!deleted) {
      throw new HttpException(
        'Sale not found or could not be deleted',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Sale deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async resetInventory(
    @Body() resetDto: ResetSalesDto,
  ): Promise<{ message: string }> {
    return this.salesService.resetTable(resetDto.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-by-occupation')
  async deleteByOccupation(
    @Body(new ValidationPipe()) deleteDto: DeleteSalesByOccupationDto,
  ): Promise<{ message: string; deletedCount: number }> {
    return this.salesService.deleteByOccupationAndUser(
      deleteDto.userId,
      deleteDto.occupation,
    );
  }
}
