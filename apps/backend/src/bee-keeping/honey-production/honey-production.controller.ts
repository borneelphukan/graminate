import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { HoneyProductionService } from './honey-production.service';
import {
  CreateHoneyProductionDto,
  UpdateHoneyProductionDto,
} from './honey-production.dto';
import { honeyProductionSchema } from '@graminate/shared';
import { honey_production } from '@prisma/client';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('honey-production')
@UseGuards(JwtAuthGuard)
export class HoneyProductionController {
  constructor(private readonly productionService: HoneyProductionService) {}

  @Get('hive/:hiveId')
  async getByHiveId(
    @Param('hiveId', ParseIntPipe) hiveId: number,
  ): Promise<{ harvests: honey_production[] }> {
    const harvests = await this.productionService.findByHiveId(hiveId);
    return { harvests };
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<honey_production> {
    return this.productionService.findById(id);
  }

  @UseZodSchema(honeyProductionSchema)
  @Post('add')
  async addHarvest(
    @Body() createDto: CreateHoneyProductionDto,
  ): Promise<honey_production> {
    return this.productionService.create(createDto);
  }

  @UseZodSchema(honeyProductionSchema, { partial: true })
  @Put('update/:id')
  async updateHarvest(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHoneyProductionDto,
  ): Promise<honey_production> {
    return this.productionService.update(id, updateDto);
  }

  @Delete('delete/:id')
  async deleteHarvest(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const deleted = await this.productionService.delete(id);
    if (!deleted) {
      throw new NotFoundException(
        `Harvest with ID ${id} not found or could not be deleted`,
      );
    }
    return { message: 'Harvest deleted successfully' };
  }

  @Post('reset')
  async reset(
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    return this.productionService.resetTable(req.user.userId!);
  }
}
