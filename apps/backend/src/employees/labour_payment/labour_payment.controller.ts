import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { labourPaymentsSchema } from '@graminate/shared';
import { LabourPaymentService } from './labour_payment.service';
import { Response } from 'express';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';
import { RequestWithUser } from '@/common/types/request.type';
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
  user_id?: number;
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
  @UseZodSchema(labourPaymentsSchema)
  @Post('add')
  async addPayment(
    @Body() body: LabourPaymentBody,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    body.user_id = req.user.userId!;
    const result = await this.labourPaymentService.addPayment(body);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @UseZodSchema(labourPaymentsSchema, { partial: true })
  @Put('update')
  async updatePayment(
    @Body() body: LabourPaymentBody,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.labourPaymentService.updatePayment(body);
    return res.status(result.status).json(result.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deletePayment(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.labourPaymentService.deletePayment(id);
    return res.status(result.status).json(result.data);
  }
}
