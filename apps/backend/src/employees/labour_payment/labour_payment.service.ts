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
      salary_paid === undefined
    ) {
      return { status: 400, data: { error: 'Missing required fields' } };
    }

    const cleanLabourId = Number(labour_id);
    if (isNaN(cleanLabourId)) {
      return { status: 400, data: { error: 'Invalid labour_id' } };
    }

    try {
      const salary = Number(salary_paid || 0);
      const bonusVal = Number(bonus || 0);
      const overtime = Number(overtime_pay || 0);
      const housing = Number(housing_allowance || 0);
      const travel = Number(travel_allowance || 0);
      const meal = Number(meal_allowance || 0);

      const total_amount = salary + bonusVal + overtime + housing + travel + meal;

      const newPayment = await this.prisma.labour_payments.create({
        data: {
          labour_id: cleanLabourId,
          payment_date: new Date(payment_date),
          salary_paid: new Prisma.Decimal(salary),
          bonus: new Prisma.Decimal(bonusVal),
          overtime_pay: new Prisma.Decimal(overtime),
          housing_allowance: new Prisma.Decimal(housing),
          travel_allowance: new Prisma.Decimal(travel),
          meal_allowance: new Prisma.Decimal(meal),
          total_amount: new Prisma.Decimal(total_amount),
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
    if (!payment_id || isNaN(Number(payment_id))) {
      return { status: 400, data: { error: 'Missing or invalid payment_id' } };
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
        updateData.salary_paid = new Prisma.Decimal(Number(body.salary_paid));
      if (body.bonus !== undefined)
        updateData.bonus = new Prisma.Decimal(Number(body.bonus));
      if (body.overtime_pay !== undefined)
        updateData.overtime_pay = new Prisma.Decimal(Number(body.overtime_pay));
      if (body.housing_allowance !== undefined)
        updateData.housing_allowance = new Prisma.Decimal(
          Number(body.housing_allowance),
        );
      if (body.travel_allowance !== undefined)
        updateData.travel_allowance = new Prisma.Decimal(
          Number(body.travel_allowance),
        );
      if (body.meal_allowance !== undefined)
        updateData.meal_allowance = new Prisma.Decimal(
          Number(body.meal_allowance),
        );
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
      updateData.total_amount = new Prisma.Decimal(total_amount);

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

  async deletePayment(id: string): Promise<{
    status: number;
    data: { message?: string; error?: string };
  }> {
    const paymentId = parseInt(id, 10);
    if (isNaN(paymentId)) {
      return {
        status: 400,
        data: { error: 'Invalid or missing payment_id' },
      };
    }

    try {
      const existing = await this.prisma.labour_payments.findUnique({
        where: { payment_id: paymentId },
      });

      if (!existing) {
        return { status: 404, data: { error: 'Payment record not found' } };
      }

      await this.prisma.labour_payments.delete({
        where: { payment_id: paymentId },
      });

      return { status: 200, data: { message: 'Payment deleted successfully' } };
    } catch (error) {
      console.error('Error deleting payment:', error);
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }
}
