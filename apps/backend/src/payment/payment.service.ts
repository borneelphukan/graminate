import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto, VerifyPaymentDto } from './payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async createOrder(createPaymentDto: CreatePaymentDto) {
    return this.paymentRepository.createOrder(createPaymentDto);
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentRepository.verifyPayment(verifyPaymentDto);
  }
}
