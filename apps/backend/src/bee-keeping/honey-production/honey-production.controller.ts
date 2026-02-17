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
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { HoneyProductionService } from './honey-production.service';
import {
  CreateHoneyProductionDto,
  UpdateHoneyProductionDto,
} from './honey-production.dto';

@Controller('honey-production')
@UseGuards(JwtAuthGuard)
export class HoneyProductionController {
  constructor(private readonly productionService: HoneyProductionService) { }

  @Get('hive/:hiveId')
  async getByHiveId(@Param('hiveId', ParseIntPipe) hiveId: number) {
    const harvests = await this.productionService.findByHiveId(hiveId);
    return { harvests };
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.findById(id);
  }

  @Post('add')
  async addHarvest(@Body() createDto: CreateHoneyProductionDto) {
    return this.productionService.create(createDto);
  }

  @Put('update/:id')
  async updateHarvest(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHoneyProductionDto,
  ) {
    return this.productionService.update(id, updateDto);
  }

  @Delete('delete/:id')
  async deleteHarvest(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.productionService.delete(id);
    if (!deleted) {
      throw new NotFoundException(
        `Harvest with ID ${id} not found or could not be deleted`,
      );
    }
    return { message: 'Harvest deleted successfully' };
  }

  @Post('reset')
  async reset() {
    return this.productionService.resetTable();
  }
}
