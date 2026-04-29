import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FloricultureService } from './floriculture.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { floriculture } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('floriculture')
export class FloricultureController {
  constructor(private readonly floricultureService: FloricultureService) {}

  @Post('add')
  create(@Body() body: Partial<floriculture>): Promise<floriculture> {
    return this.floricultureService.create(body);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ floricultures: floriculture[] }> {
    return this.floricultureService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<floriculture | null> {
    return this.floricultureService.findOne(id);
  }

  @Get('watering/:userId')
  getWateringEvents(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any[]> {
    return this.floricultureService.getWateringEvents(userId);
  }

  @Get('watering/:userId/:date')
  getWateringByDate(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('date') date: string,
  ): Promise<any[]> {
    return this.floricultureService.getWateringByDate(userId, date);
  }

  @Post('watering')
  updateWatering(
    @Body()
    body: {
      userId: number;
      flowerId: number;
      date: string;
      watered: boolean;
    },
  ): Promise<any> {
    return this.floricultureService.updateWatering(
      body.userId,
      body.flowerId,
      body.date,
      body.watered,
    );
  }

  @Put('update/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<floriculture>,
  ): Promise<floriculture> {
    return this.floricultureService.update(id, body);
  }

  @Delete('delete/:id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<floriculture> {
    return this.floricultureService.remove(id);
  }

  @Post('delete-multiple')
  removeMultiple(@Body('ids') ids: number[]): Promise<any> {
    return this.floricultureService.removeMultiple(ids);
  }

  @Post('reset-service')
  async reset(@Body('userId') userId: number): Promise<{ message: string }> {
    await this.floricultureService.reset(userId);
    return { message: `Floriculture table reset for user ${userId}` };
  }
}
