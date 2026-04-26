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
import { FlockService } from './flock.service';
import { CreateFlockDto, UpdateFlockDto, ResetFlockDto } from './flock.dto';
import { poultry_flock } from '@prisma/client';

@Controller('flock')
export class FlockController {
  constructor(private readonly flockService: FlockService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ flocks: poultry_flock[] }> {
    const flocks = await this.flockService.findByUserId(userId);
    return { flocks };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<poultry_flock> {
    const flock = await this.flockService.findById(id);
    if (!flock) {
      throw new HttpException('Flock not found', HttpStatus.NOT_FOUND);
    }
    return flock;
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addFlock(@Body() createDto: CreateFlockDto): Promise<poultry_flock> {
    return this.flockService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  async updateFlock(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFlockDto,
  ): Promise<poultry_flock> {
    const updatedFlock = await this.flockService.update(id, updateDto);
    if (!updatedFlock) {
      throw new HttpException('Flock not found', HttpStatus.NOT_FOUND);
    }
    return updatedFlock;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteFlock(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const deleted = await this.flockService.delete(id);
    if (!deleted) {
      throw new HttpException(
        'Flock not found or could not be deleted',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Flock deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-service')
  async resetService(
    @Body() resetDto: ResetFlockDto,
  ): Promise<{ message: string }> {
    return this.flockService.resetForUser(resetDto.userId);
  }
}
