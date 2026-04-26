import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, labour_payments } from '@prisma/client';

@Injectable()
export class LabourPaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async getPayments(labourId: string): Promise<{
    status: number;
    data: { payments?: labour_payments[]; error?: string };
  }> {
    if (!labourId || isNaN(Number(labourId))) {
      return {
        status: 400,
        data: { error: 'Invalid or missing labourId parameter' },
      };
    }

    try {
      const paymentsList = await this.prisma.labour_payments.findMany({
        where: { labour_id: Number(labourId) },
        orderBy: { payment_date: 'desc' },
      });

      if (paymentsList.length === 0) {
        return {
          status: 404,
          data: { error: 'No payment records found for this labour' },
        };
      }

      return { status: 200, data: { payments: paymentsList } };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }

  async addPayment(body: {
    labour_id?: number;
    payment_date?: string | Date;
    salary_paid?: number | Prisma.Decimal;
    bonus?: number | Prisma.Decimal;
    overtime_pay?: number | Prisma.Decimal;
    housing_allowance?: number | Prisma.Decimal;
    travel_allowance?: number | Prisma.Decimal;
    meal_allowance?: number | Prisma.Decimal;
    payment_status?: string;
  }): Promise<{
    status: number;
    data: { message?: string; error?: string; payment?: labour_payments };
  }> {
    const {
      labour_id,
      payment_date,
      salary_paid,
      bonus,
      overtime_pay,
      housing_allowance,
      travel_allowance,
      meal_allowance,
      payment_status,
    } = body;

    if (
      !labour_id ||
      !payment_date ||
      salary_paid === undefined ||
      bonus === undefined ||
      overtime_pay === undefined ||
      housing_allowance === undefined ||
      travel_allowance === undefined ||
      meal_allowance === undefined
    ) {
      return { status: 400, data: { error: 'Missing required fields' } };
    }

    try {
      const total_amount =
        Number(salary_paid) +
        Number(bonus) +
        Number(overtime_pay) +
        Number(housing_allowance) +
        Number(travel_allowance) +
        Number(meal_allowance);

      const newPayment = await this.prisma.labour_payments.create({
        data: {
          labour_id,
          payment_date: new Date(payment_date),
          salary_paid,
          bonus,
          overtime_pay,
          housing_allowance,
          travel_allowance,
          meal_allowance,
          total_amount,
          payment_status: payment_status || 'Pending',
        },
      });

      return {
        status: 201,
        data: { message: 'Payment added successfully', payment: newPayment },
      };
    } catch (error) {
      console.error('Error inserting payment:', error);
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }

  async updatePayment(body: {
    payment_id?: number;
    payment_date?: string | Date;
    salary_paid?: number | Prisma.Decimal;
    bonus?: number | Prisma.Decimal;
    overtime_pay?: number | Prisma.Decimal;
    housing_allowance?: number | Prisma.Decimal;
    travel_allowance?: number | Prisma.Decimal;
    meal_allowance?: number | Prisma.Decimal;
    payment_status?: string;
  }): Promise<{
    status: number;
    data: { message?: string; error?: string; payment?: labour_payments };
  }> {
    const { payment_id } = body;
    if (!payment_id) {
      return { status: 400, data: { error: 'Missing payment_id' } };
    }

    try {
      const existing = await this.prisma.labour_payments.findUnique({
        where: { payment_id: payment_id },
      });

      if (!existing) {
        return { status: 404, data: { error: 'Payment record not found' } };
      }

      const updateData: Prisma.labour_paymentsUpdateInput = {};
      if (body.payment_date)
        updateData.payment_date = new Date(body.payment_date);
      if (body.salary_paid !== undefined)
        updateData.salary_paid = body.salary_paid;
      if (body.bonus !== undefined) updateData.bonus = body.bonus;
      if (body.overtime_pay !== undefined)
        updateData.overtime_pay = body.overtime_pay;
      if (body.housing_allowance !== undefined)
        updateData.housing_allowance = body.housing_allowance;
      if (body.travel_allowance !== undefined)
        updateData.travel_allowance = body.travel_allowance;
      if (body.meal_allowance !== undefined)
        updateData.meal_allowance = body.meal_allowance;
      if (body.payment_status) updateData.payment_status = body.payment_status;

      // Recalculate total
      const salary = Number(
        body.salary_paid !== undefined
          ? body.salary_paid
          : existing.salary_paid,
      );
      const bonusVal = Number(
        body.bonus !== undefined ? body.bonus : existing.bonus,
      );
      const overtime = Number(
        body.overtime_pay !== undefined
          ? body.overtime_pay
          : existing.overtime_pay,
      );
      const housing = Number(
        body.housing_allowance !== undefined
          ? body.housing_allowance
          : existing.housing_allowance,
      );
      const travel = Number(
        body.travel_allowance !== undefined
          ? body.travel_allowance
          : existing.travel_allowance,
      );
      const meal = Number(
        body.meal_allowance !== undefined
          ? body.meal_allowance
          : existing.meal_allowance,
      );

      const total_amount =
        salary + bonusVal + overtime + housing + travel + meal;
      updateData.total_amount = total_amount;

      const updatedPayment = await this.prisma.labour_payments.update({
        where: { payment_id: payment_id },
        data: updateData,
      });

      return {
        status: 200,
        data: {
          message: 'Payment updated successfully',
          payment: updatedPayment,
        },
      };
    } catch (error) {
      console.error('Error updating payment:', error);
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }
}
