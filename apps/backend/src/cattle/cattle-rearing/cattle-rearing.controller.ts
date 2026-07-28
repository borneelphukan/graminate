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
  UnauthorizedException,
  Request,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { CattleRearingService } from './cattle-rearing.service';
import {
  CreateCattleRearingDto,
  UpdateCattleRearingDto,
  ResetCattleRearingDto,
} from './cattle-rearing.dto';
import { cattle_rearing } from '@prisma/client';

import { cattleRearingSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('cattle-rearing')
export class CattleRearingController {
  constructor(private readonly cattleRearingService: CattleRearingService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ): Promise<{ cattleRearings: cattle_rearing[] }> {
    if (String(req.user.userId) !== String(userId)) {
      throw new UnauthorizedException('Access denied');
    }
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
  @UseZodSchema(cattleRearingSchema)
  @Post('add')
  async addCattleRearing(
    @Body() createDto: CreateCattleRearingDto,
    @Request() req: RequestWithUser,
  ): Promise<cattle_rearing> {
    createDto.user_id = req.user.userId!;
    return this.cattleRearingService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(cattleRearingSchema, { partial: true })
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
  async reset(@Request() req: RequestWithUser): Promise<{ message: string }> {
    return this.cattleRearingService.resetTable(req.user.userId!);
  }
}
