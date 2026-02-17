import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class LabourPaymentService {
  constructor(private readonly prisma: PrismaService) {}
  async getPayments(labourId: string) {
    if (!labourId || isNaN(Number(labourId))) {
      return {
        status: 400,
        data: { error: 'Invalid or missing labourId parameter' },
      };
    }

    try {
      const payments = await this.prisma.labour_payments.findMany({
        where: { labour_id: Number(labourId) },
        orderBy: { payment_date: 'desc' },
      });

      if (payments.length === 0) {
        return {
          status: 404,
          data: { error: 'No payment records found for this labour' },
        };
      }

      return { status: 200, data: { payments } };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }

  async addPayment(body: any) {
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
        }
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

  async updatePayment(body: any) {
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

      const updateData: any = {};
      if (body.payment_date) updateData.payment_date = new Date(body.payment_date);
      if (body.salary_paid !== undefined) updateData.salary_paid = body.salary_paid;
      if (body.bonus !== undefined) updateData.bonus = body.bonus;
      if (body.overtime_pay !== undefined) updateData.overtime_pay = body.overtime_pay;
      if (body.housing_allowance !== undefined) updateData.housing_allowance = body.housing_allowance;
      if (body.travel_allowance !== undefined) updateData.travel_allowance = body.travel_allowance;
      if (body.meal_allowance !== undefined) updateData.meal_allowance = body.meal_allowance;
      if (body.payment_status) updateData.payment_status = body.payment_status;

      if (Object.keys(updateData).length === 0 && !body.payment_date && Object.keys(body).length === 1) { 
        // Logic check: if nothing updated. But simpler:
        // Recalculate total if any money field changed
      }

      // Helper to get value
      const getVal = (val: any, oldVal: any) => Number(val !== undefined ? val : oldVal);

      // We need to recalculate total if any component changed
      const salary = getVal(body.salary_paid, existing.salary_paid);
      const bonusVal = getVal(body.bonus, existing.bonus);
      const overtime = getVal(body.overtime_pay, existing.overtime_pay);
      const housing = getVal(body.housing_allowance, existing.housing_allowance);
      const travel = getVal(body.travel_allowance, existing.travel_allowance);
      const meal = getVal(body.meal_allowance, existing.meal_allowance);
      
      const total_amount = salary + bonusVal + overtime + housing + travel + meal;
      updateData.total_amount = total_amount;

      if (Object.keys(updateData).length === 0) { // Should include total_amount now
           return { status: 400, data: { error: 'No fields provided to update' } };
      }

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
