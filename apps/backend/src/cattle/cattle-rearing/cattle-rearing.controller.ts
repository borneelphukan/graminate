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
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CattleRearingService } from './cattle-rearing.service';
import {
  CreateCattleRearingDto,
  UpdateCattleRearingDto,
  ResetCattleRearingDto,
} from './cattle-rearing.dto';
import { cattle_rearing } from '@prisma/client';

@Controller('cattle-rearing')
export class CattleRearingController {
  constructor(private readonly cattleRearingService: CattleRearingService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ cattleRearings: cattle_rearing[] }> {
    const cattleRearings = await this.cattleRearingService.findByUserId(userId);
    return { cattleRearings };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<cattle_rearing> {
    return this.cattleRearingService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addCattleRearing(
    @Body() createDto: CreateCattleRearingDto,
  ): Promise<cattle_rearing> {
    return this.cattleRearingService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  async updateCattleRearing(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCattleRearingDto,
  ): Promise<cattle_rearing> {
    return this.cattleRearingService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteCattleRearing(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const deleted = await this.cattleRearingService.delete(id);
    if (!deleted) {
      throw new HttpException(
        'Cattle rearing record not found or could not be deleted',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Cattle rearing record deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-service')
  async resetService(
    @Body() resetDto: ResetCattleRearingDto,
  ): Promise<{ message: string }> {
    return this.cattleRearingService.resetForUser(resetDto.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async reset(): Promise<{ message: string }> {
    return this.cattleRearingService.resetTable();
  }
}
