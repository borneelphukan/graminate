import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { laboursSchema } from '@graminate/shared';
import { LabourService } from './labour.service';
import { Response } from 'express';
import { CreateOrUpdateLabourDto } from './labour.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';
import { RequestWithUser } from '@/common/types/request.type';

@Controller('labour')
export class LabourController {
  constructor(private readonly labourService: LabourService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getLabours(@Param('id') id: string, @Res() res: Response) {
    const result = await this.labourService.getLabours(id);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(laboursSchema)
  @Post('add')
  async addLabour(@Body() body: CreateOrUpdateLabourDto, @Request() req: RequestWithUser, @Res() res: Response) {
    body.user_id = req.user.userId!;
    const result = await this.labourService.addLabour(body);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(laboursSchema, { partial: true })
  @Put('update')
  async updateLabour(
    @Body() body: CreateOrUpdateLabourDto,
    @Res() res: Response,
  ) {
    const result = await this.labourService.updateLabour(body);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteLabour(@Param('id') id: string, @Res() res: Response) {
    const result = await this.labourService.deleteLabour(id);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async reset(@Request() req: RequestWithUser) {
    return this.labourService.resetTable(req.user.userId!);
  }
}
