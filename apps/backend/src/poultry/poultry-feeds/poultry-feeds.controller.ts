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
  Request,
} from '@nestjs/common';
import { PoultryFeedsService } from './poultry-feeds.service';
import {
  CreatePoultryFeedDto,
  UpdatePoultryFeedDto,
  ResetPoultryFeedsDto,
} from './poultry-feeds.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { poultry_feeds } from '@prisma/client';
import { poultryFeedsSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('poultry-feeds')
export class PoultryFeedsController {
  constructor(private readonly poultryFeedsService: PoultryFeedsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getPoultryFeedRecords(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('flockId') flockId?: string,
  ): Promise<{ records: poultry_feeds[] }> {
    const records = await this.poultryFeedsService.findByUserIdWithFilters(
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
  async getPoultryFeedRecordById(
    @Param('id') id: string,
  ): Promise<poultry_feeds> {
    const record = await this.poultryFeedsService.findById(Number(id));
    if (!record) {
      throw new NotFoundException('Poultry feed record not found');
    }
    return record;
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(poultryFeedsSchema)
  @Post('add')
  async addPoultryFeedRecord(
    @Body() createDto: CreatePoultryFeedDto,
    @Request() req: RequestWithUser,
  ): Promise<poultry_feeds> {
    createDto.user_id = req.user.userId!;
    const newRecord = await this.poultryFeedsService.create(createDto);
    return newRecord;
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(poultryFeedsSchema, { partial: true })
  @Put('update/:id')
  async updatePoultryFeedRecord(
    @Param('id') id: string,
    @Body() updateDto: UpdatePoultryFeedDto,
  ): Promise<poultry_feeds> {
    const updatedRecord = await this.poultryFeedsService.update(
      Number(id),
      updateDto,
    );
    if (!updatedRecord) {
      throw new NotFoundException('Poultry feed record not found');
    }
    return updatedRecord;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deletePoultryFeedRecord(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const deleted = await this.poultryFeedsService.delete(Number(id));
    if (!deleted) {
      throw new NotFoundException('Poultry feed record not found');
    }
    return { message: 'Poultry feed record deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async resetUserPoultryFeedRecords(
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    return this.poultryFeedsService.resetTable(req.user.userId!);
  }
}
