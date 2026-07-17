import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, VerifyPaymentDto } from './payment.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { createPaymentSchema, verifyPaymentSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@UseGuards(JwtAuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseZodSchema(createPaymentSchema)
  @Post('create-order')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createPaymentDto: CreatePaymentDto, @Request() req: RequestWithUser): Promise<any> {
    createPaymentDto.userId = req.user.userId!;
    return await this.paymentService.createOrder(createPaymentDto);
  }

  // Haven't tested yet. Test after KYC of Razorpay
  @UseZodSchema(verifyPaymentSchema)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(
    @Body() verifyPaymentDto: VerifyPaymentDto,
  ): Promise<any> {
    return await this.paymentService.verifyPayment(verifyPaymentDto);
  }
}
