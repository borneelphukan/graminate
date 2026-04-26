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
import { CattleMilkService } from './cattle-milk.service';
import {
  CreateCattleMilkDto,
  ResetCattleMilkDto,
  UpdateCattleMilkDto,
} from './cattle-milk.dto';
import { cattle_milk } from '@prisma/client';

@Controller('cattle-milk')
export class CattleMilkController {
  constructor(private readonly cattleMilkService: CattleMilkService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ cattleMilkRecords: cattle_milk[] }> {
    const records = await this.cattleMilkService.findByUserId(userId);
    return { cattleMilkRecords: records };
  }

  @UseGuards(JwtAuthGuard)
  @Get('cattle/:cattleId')
  async getByCattleId(
    @Param('cattleId', ParseIntPipe) cattleId: number,
  ): Promise<{ cattleMilkRecords: cattle_milk[] }> {
    const records = await this.cattleMilkService.findByCattleId(cattleId);
    return { cattleMilkRecords: records };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<cattle_milk> {
    return this.cattleMilkService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addRecord(
    @Body() createDto: CreateCattleMilkDto,
  ): Promise<cattle_milk> {
    return this.cattleMilkService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  async updateRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCattleMilkDto,
  ): Promise<cattle_milk> {
    return this.cattleMilkService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteRecord(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const deleted = await this.cattleMilkService.delete(id);
    if (!deleted) {
      throw new HttpException(
        'Cattle milk record not found or could not be deleted',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Cattle milk record deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('animal-names/:cattleId')
  async getAnimalNamesForHerd(
    @Param('cattleId', ParseIntPipe) cattleId: number,
  ): Promise<{ animalNames: string[] }> {
    const names =
      await this.cattleMilkService.findAnimalNamesByCattleId(cattleId);
    return { animalNames: names };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async resetWarehouse(
    @Body() resetDto: ResetCattleMilkDto,
  ): Promise<{ message: string }> {
    return this.cattleMilkService.resetTable(resetDto.userId);
  }
}
