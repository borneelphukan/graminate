import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto, VerifyPaymentDto } from './payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async createOrder(createPaymentDto: CreatePaymentDto): Promise<any> {
    return this.paymentRepository.createOrder(createPaymentDto);
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto): Promise<any> {
    return this.paymentRepository.verifyPayment(verifyPaymentDto);
  }
}
