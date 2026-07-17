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
import { HiveInspectionService } from './hive-inspection.service';
import {
  CreateInspectionDto,
  UpdateInspectionDto,
} from './hive-inspection.dto';
import { hiveInspectionSchema } from '@graminate/shared';
import { hive_inspection } from '@prisma/client';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('hive-inspections')
@UseGuards(JwtAuthGuard)
export class HiveInspectionController {
  constructor(private readonly inspectionService: HiveInspectionService) {}

  @Get('hive/:hiveId')
  async getByHiveId(
    @Param('hiveId', ParseIntPipe) hiveId: number,
  ): Promise<{ inspections: hive_inspection[] }> {
    const inspections = await this.inspectionService.findByHiveId(hiveId);
    return { inspections };
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<hive_inspection> {
    return this.inspectionService.findById(id);
  }

  @UseZodSchema(hiveInspectionSchema)
  @Post('add')
  async addInspection(
    @Body() createDto: CreateInspectionDto,
  ): Promise<hive_inspection> {
    return this.inspectionService.create(createDto);
  }

  @UseZodSchema(hiveInspectionSchema, { partial: true })
  @Put('update/:id')
  async updateInspection(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInspectionDto,
  ): Promise<hive_inspection> {
    return this.inspectionService.update(id, updateDto);
  }

  @Delete('delete/:id')
  async deleteInspection(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const deleted = await this.inspectionService.delete(id);
    if (!deleted) {
      throw new NotFoundException(
        `Inspection with ID ${id} not found or could not be deleted`,
      );
    }
    return { message: 'Inspection deleted successfully' };
  }

  @Post('reset')
  async reset(
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    return this.inspectionService.resetTable(req.user.userId!);
  }
}
