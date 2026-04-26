import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LabourPaymentService } from './labour_payment.service';
import { Response } from 'express';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Prisma } from '@prisma/client';

interface LabourPaymentBody {
  payment_id?: number;
  labour_id?: number;
  payment_date?: string | Date;
  salary_paid?: number | Prisma.Decimal;
  bonus?: number | Prisma.Decimal;
  overtime_pay?: number | Prisma.Decimal;
  housing_allowance?: number | Prisma.Decimal;
  travel_allowance?: number | Prisma.Decimal;
  meal_allowance?: number | Prisma.Decimal;
  payment_status?: string;
}

@Controller('labour_payment')
export class LabourPaymentController {
  constructor(private readonly labourPaymentService: LabourPaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':labourId')
  async getPayments(
    @Param('labourId') labourId: string,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.labourPaymentService.getPayments(labourId);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addPayment(
    @Body() body: LabourPaymentBody,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.labourPaymentService.addPayment(body);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  async updatePayment(
    @Body() body: LabourPaymentBody,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.labourPaymentService.updatePayment(body);
    return res.status(result.status).json(result.data);
  }
}
