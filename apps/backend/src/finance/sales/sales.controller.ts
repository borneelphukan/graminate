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
import { SalesService } from './sales.service';
import {
  CreateSaleDto,
  UpdateSaleDto,
  DeleteSalesByOccupationDto,
  ResetSalesDto,
} from './sales.dto';
import { sales } from '@prisma/client';
import { salesSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ): Promise<{ sales: sales[] }> {
    if (String(req.user.userId) !== String(userId)) {
      throw new UnauthorizedException('Access denied');
    }
    const salesList = await this.salesService.findByUserId(userId);
    return { sales: salesList };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<sales> {
    return this.salesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(salesSchema)
  @Post('add')
  async addSale(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createDto: CreateSaleDto,
    @Request() req: RequestWithUser,
  ): Promise<sales> {
    try {
      createDto.user_id = req.user.userId!;
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
    @Request() req: RequestWithUser,
  ): Promise<sales> {
    try {
      const updatedSale = await this.salesService.update(
        id,
        updateDto,
        req.user.userId,
      );
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
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const deleted = await this.salesService.delete(id, req.user.userId);
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
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    return this.salesService.resetTable(req.user.userId!);
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
