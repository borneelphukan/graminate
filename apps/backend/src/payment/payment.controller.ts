import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, VerifyPaymentDto } from './payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('create-order')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentService.createOrder(createPaymentDto);
  }

  // Haven't tested yet. Test after KYC of Razorpay
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return await this.paymentService.verifyPayment(verifyPaymentDto);
  }
}
