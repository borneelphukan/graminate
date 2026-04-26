import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePaymentDto, VerifyPaymentDto } from './payment.dto';
import * as crypto from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { user_plan_type } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const Razorpay = require('razorpay');

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

@Injectable()
export class PaymentRepository {
  private razorpay: any;
  private readonly razorpayKeySecret: string;
  private readonly logger = new Logger(PaymentRepository.name);

  constructor(private readonly prisma: PrismaService) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      this.logger.error(
        'Razorpay Key ID or Key Secret is not set in environment variables.',
      );
      throw new InternalServerErrorException(
        'Payment gateway configuration error.',
      );
    }

    this.razorpayKeySecret = keySecret;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(
    createPaymentDto: CreatePaymentDto,
  ): Promise<RazorpayOrder> {
    const { amount, currency, userId, planType } = createPaymentDto;
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    let razorpayOrder: RazorpayOrder;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      razorpayOrder = (await this.razorpay.orders.create(
        options,
      )) as RazorpayOrder;
    } catch (error) {
      this.logger.error('Error creating Razorpay order:', error);
      throw new InternalServerErrorException('Error creating Razorpay order');
    }

    try {
      await this.prisma.payments.create({
        data: {
          user_id: userId,
          razorpay_order_id: razorpayOrder.id,
          amount,
          currency,
          plan_type: planType as user_plan_type,
          status: 'PENDING',
        },
      });
    } catch (error) {
      this.logger.error('Error saving payment to database:', error);
      throw new InternalServerErrorException('Failed to save payment record.');
    }

    return razorpayOrder;
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
    } = verifyPaymentDto;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', this.razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    const signatureIsValid = expectedSignature === razorpay_signature;

    if (!signatureIsValid) {
      await this.updatePaymentStatus(
        razorpay_order_id,
        'FAILED',
        razorpay_payment_id,
        razorpay_signature,
      );
      throw new BadRequestException(
        'Payment verification failed: Invalid signature.',
      );
    }

    const updatedPayment = await this.updatePaymentStatus(
      razorpay_order_id,
      'SUCCESS',
      razorpay_payment_id,
      razorpay_signature,
    );

    await this.updateUserSubscription(
      updatedPayment.user_id,
      planType as 'BASIC' | 'PRO',
      updatedPayment.razorpay_order_id,
    );

    return {
      signatureIsValid: true,
      message: 'Payment verified and subscription updated successfully.',
    };
  }

  private async updatePaymentStatus(
    orderId: string,
    status: 'SUCCESS' | 'FAILED',
    paymentId: string,
    signature: string,
  ): Promise<{ user_id: number; razorpay_order_id: string }> {
    try {
      const payment = await this.prisma.payments.findFirst({
        where: { razorpay_order_id: orderId },
      });

      if (!payment) {
        throw new NotFoundException(
          `Payment with order ID ${orderId} not found.`,
        );
      }

      if (payment.status !== 'PENDING') {
        this.logger.warn(
          `Payment ${orderId} has already been processed with status: ${payment.status}.`,
        );
        if (payment.status === 'SUCCESS')
          return {
            user_id: payment.user_id,
            razorpay_order_id: payment.razorpay_order_id,
          };
        throw new BadRequestException(
          `Payment has already been processed with status: ${payment.status}.`,
        );
      }

      const updatedPayment = await this.prisma.payments.update({
        where: { payment_id: payment.payment_id },
        data: {
          status,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          updated_at: new Date(),
        },
        select: {
          user_id: true,
          razorpay_order_id: true,
        },
      });

      return updatedPayment;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Error updating payment status for order ${orderId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Could not update payment status.',
      );
    }
  }

  private async updateUserSubscription(
    userId: number,
    planType: 'BASIC' | 'PRO',
    orderIdForLogging: string,
  ) {
    try {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);

      await this.prisma.users.update({
        where: { user_id: userId },
        data: {
          plan: planType,
          subscription_expires_at: newExpiryDate,
        },
      });

      this.logger.log(
        `Successfully updated subscription to ${planType} for user ${userId} from payment ${orderIdForLogging}`,
      );
    } catch (error) {
      this.logger.error(
        `CRITICAL: FAILED to update user subscription for user ${userId} (from order ${orderIdForLogging}). This requires manual intervention.`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to update user subscription status after successful payment.',
      );
    }
  }
}
