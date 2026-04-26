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
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto, UpdateLoanDto } from './loans.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { loans } from '@prisma/client';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post('user/:userId')
  async create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createLoanDto: CreateLoanDto,
  ): Promise<loans> {
    return this.loansService.create(userId, createLoanDto);
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

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
  ): Promise<loans> {
    return this.loansService.update(id, updateLoanDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<loans> {
    return this.loansService.remove(id);
  }
}
