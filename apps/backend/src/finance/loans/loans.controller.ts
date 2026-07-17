import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto, UpdateLoanDto } from './loans.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { loans } from '@prisma/client';
import { loansSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @UseZodSchema(loansSchema)
  @Post()
  async create(
    @Body() createLoanDto: CreateLoanDto,
    @Request() req: RequestWithUser,
  ): Promise<loans> {
    return this.loansService.create(req.user.userId!, createLoanDto);
  }

  @Get('user/:userId')
  async findAll(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<loans[]> {
    return this.loansService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<loans> {
    return this.loansService.findOne(id);
  }

  @UseZodSchema(loansSchema, { partial: true })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
    @Request() req: RequestWithUser,
  ): Promise<loans> {
    return this.loansService.update(id, req.user.userId!, updateLoanDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<loans> {
    return this.loansService.remove(id, req.user.userId!);
  }
}
