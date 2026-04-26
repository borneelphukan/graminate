import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PoultryEggsService } from './poultry-eggs.service';
import {
  CreatePoultryEggDto,
  UpdatePoultryEggDto,
  ResetPoultryEggDto,
} from './poultry-eggs.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { poultry_eggs } from '@prisma/client';

@Controller('poultry-eggs')
export class PoultryEggsController {
  constructor(private readonly poultryEggsService: PoultryEggsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getPoultryEggRecords(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('flockId') flockId?: string,
  ): Promise<{ records: poultry_eggs[] }> {
    const records = await this.poultryEggsService.findByUserIdWithFilters(
      Number(userId),
      {
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        flockId: flockId ? Number(flockId) : undefined,
      },
    );
    return { records };
  }

  @UseGuards(JwtAuthGuard)
  @Get('record/:id')
  async getPoultryEggRecordById(
    @Param('id') id: string,
  ): Promise<poultry_eggs> {
    const record = await this.poultryEggsService.findById(Number(id));
    if (!record) {
      throw new NotFoundException('Poultry egg record not found');
    }
    return record;
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addPoultryEggRecord(
    @Body() createDto: CreatePoultryEggDto,
  ): Promise<poultry_eggs> {
    const newRecord = await this.poultryEggsService.create(createDto);
    return newRecord;
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  async updatePoultryEggRecord(
    @Param('id') id: string,
    @Body() updateDto: UpdatePoultryEggDto,
  ): Promise<poultry_eggs> {
    const updatedRecord = await this.poultryEggsService.update(
      Number(id),
      updateDto,
    );
    if (!updatedRecord) {
      throw new NotFoundException('Poultry egg record not found');
    }
    return updatedRecord;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deletePoultryEggRecord(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const deleted = await this.poultryEggsService.delete(Number(id));
    if (!deleted) {
      throw new NotFoundException('Poultry egg record not found');
    }
    return { message: 'Poultry egg record deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async resetUserPoultryEggRecords(
    @Body() resetDto: ResetPoultryEggDto,
  ): Promise<{ message: string }> {
    return this.poultryEggsService.resetTable(resetDto.userId);
  }
}
