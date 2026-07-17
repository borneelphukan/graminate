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
  Request,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { WarehouseService } from './warehouse.service';
import {
  CreateWarehouseDto,
  ResetWarehouseDto,
  UpdateWarehouseDto,
} from './warehouse.dto';
import { warehouse } from '@prisma/client';
import { warehouseSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getByUserId(
    @Param('userId') userId: string,
  ): Promise<{ warehouses: warehouse[] }> {
    const warehouses = await this.warehouseService.findByUserId(Number(userId));
    return { warehouses };
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(warehouseSchema)
  @Post('add')
  async addWarehouse(
    @Body() createDto: CreateWarehouseDto,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string; id: number }> {
    createDto.user_id = req.user.userId!;
    const warehouseResult = await this.warehouseService.create(createDto);
    return {
      message: 'Warehouse created successfully',
      id: warehouseResult.warehouse_id,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(warehouseSchema, { partial: true })
  @Put('update/:id')
  async updateWarehouse(
    @Param('id') id: string,
    @Body() updateDto: UpdateWarehouseDto,
  ): Promise<warehouse> {
    const updated = await this.warehouseService.update(Number(id), updateDto);
    if (!updated) {
      throw new HttpException('Warehouse not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteWarehouse(@Param('id') id: string): Promise<{ message: string }> {
    const deleted = await this.warehouseService.delete(Number(id));
    if (!deleted) {
      throw new HttpException('Warehouse not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async resetWarehouse(
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    return this.warehouseService.resetTable(req.user.userId!);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-by-category/:category')
  async deleteByUserIdAndCategory(
    @Request() req: RequestWithUser,
    @Param('category') category: string,
  ): Promise<{ message: string }> {
    await this.warehouseService.deleteByUserIdAndCategory(
      req.user.userId!,
      category,
    );
    return { message: 'Warehouses deleted successfully by category' };
  }
}
