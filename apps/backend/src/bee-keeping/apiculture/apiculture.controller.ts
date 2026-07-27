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
import { ApicultureService, ApicultureWithCount } from './apiculture.service';
import {
  CreateApiaryDto,
  UpdateApiaryDto,
  ResetApicultureDto,
} from './apiculture.dto';

import { apicultureSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('apiculture')
export class ApicultureController {
  constructor(private readonly apicultureService: ApicultureService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ): Promise<{ apiaries: ApicultureWithCount[] }> {
    if (String(req.user.userId) !== String(userId)) {
      throw new UnauthorizedException('Access denied');
    }
    const apiaries = await this.apicultureService.findByUserId(userId);
    return { apiaries };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApicultureWithCount> {
    const apiary = await this.apicultureService.findById(id);
    if (!apiary) {
      throw new HttpException('Apiary record not found', HttpStatus.NOT_FOUND);
    }
    return apiary;
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(apicultureSchema)
  @Post('add')
  async addApiary(
    @Body() createDto: CreateApiaryDto,
    @Request() req: RequestWithUser,
  ): Promise<ApicultureWithCount> {
    createDto.user_id = req.user.userId!;
    return this.apicultureService.create(createDto as any);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(apicultureSchema, { partial: true })
  @Put('update/:id')
  async updateApiary(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateApiaryDto,
  ): Promise<ApicultureWithCount> {
    const updatedApiary = await this.apicultureService.update(id, updateDto);
    if (!updatedApiary) {
      throw new HttpException('Apiary record not found', HttpStatus.NOT_FOUND);
    }
    return updatedApiary;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteApiary(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const deleted = await this.apicultureService.delete(id);
    if (!deleted) {
      throw new HttpException(
        'Apiary record not found or could not be deleted',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Apiary record deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-service')
  async resetService(
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    return this.apicultureService.resetForUser(req.user.userId!);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async reset(@Request() req: RequestWithUser): Promise<{ message: string }> {
    return this.apicultureService.resetTable(req.user.userId!);
  }
}
