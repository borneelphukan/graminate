import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, labours } from '@prisma/client';

interface LabourBody {
  user_id?: number;
  full_name?: string;
  date_of_birth?: string | Date;
  gender?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  contact_number?: string;
  aadhar_card_number?: string;
  role?: string;
  base_salary?: number;
  bonus?: number;
  overtime_pay?: number;
  housing_allowance?: number;
  travel_allowance?: number;
  meal_allowance?: number;
  payment_frequency?: string;
  ration_card?: string;
  pan_card?: string;
  driving_license?: string;
  mnrega_job_card_number?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  bank_branch?: string;
  disability_status?: boolean;
  epfo?: string;
  esic?: string;
  pm_kisan?: boolean;
  labour_id?: number;
}

@Injectable()
export class LabourService {
  constructor(private readonly prisma: PrismaService) {}

  async getLabours(userId: string): Promise<{
    status: number;
    data: { labours?: labours[]; error?: string };
  }> {
    if (!userId || isNaN(Number(userId))) {
      return {
        status: 400,
        data: { error: 'Invalid or missing id parameter' },
      };
    }

    try {
      const laboursList = await this.prisma.labours.findMany({
        where: { user_id: Number(userId) },
        orderBy: { created_at: 'desc' },
      });

      if (laboursList.length === 0) {
        return {
          status: 404,
          data: { error: 'No labour records found for this user' },
        };
      }

      return { status: 200, data: { labours: laboursList } };
    } catch (error) {
      console.error('Error fetching labour:', error);
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }

  async addLabour(body: LabourBody): Promise<{
    status: number;
    data: { message?: string; error?: string; labour?: labours };
  }> {
    const {
      user_id,
      full_name,
      date_of_birth,
      gender,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      contact_number,
      aadhar_card_number,
      role,
      base_salary,
      bonus,
      overtime_pay,
      housing_allowance,
      travel_allowance,
      meal_allowance,
      payment_frequency,
    } = body;

    if (
      !user_id ||
      !full_name ||
      !date_of_birth ||
      !gender ||
      !address_line_1 ||
      !city ||
      !state ||
      !postal_code ||
      !contact_number ||
      !aadhar_card_number
    ) {
      return { status: 400, data: { error: 'Missing required fields' } };
    }

    try {
      let dob: Date;
      if (typeof date_of_birth === 'string' && date_of_birth.includes('/')) {
        const parts = date_of_birth.split('/');
        if (parts.length === 3) {
          dob = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          dob = new Date(date_of_birth);
        }
      } else {
        dob = new Date(date_of_birth);
      }

      const newLabour = await this.prisma.labours.create({
        data: {
          user_id: Number(user_id),
          full_name: String(full_name),
          date_of_birth: dob,
          gender: String(gender),
          address_line_1: String(address_line_1),
          address_line_2: address_line_2 ? String(address_line_2) : null,
          city: String(city),
          state: String(state),
          postal_code: String(postal_code),
          contact_number: String(contact_number),
          aadhar_card_number: String(aadhar_card_number),
          role: role ? String(role) : 'Worker',
          base_salary:
            base_salary !== undefined
              ? new Prisma.Decimal(base_salary)
              : new Prisma.Decimal(0),
          bonus: bonus !== undefined ? new Prisma.Decimal(bonus) : null,
          overtime_pay:
            overtime_pay !== undefined
              ? new Prisma.Decimal(overtime_pay)
              : null,
          housing_allowance:
            housing_allowance !== undefined
              ? new Prisma.Decimal(housing_allowance)
              : null,
          travel_allowance:
            travel_allowance !== undefined
              ? new Prisma.Decimal(travel_allowance)
              : null,
          meal_allowance:
            meal_allowance !== undefined
              ? new Prisma.Decimal(meal_allowance)
              : null,
          payment_frequency: payment_frequency
            ? String(payment_frequency)
            : 'Monthly',
        },
      });

      return {
        status: 201,
        data: { message: 'Labour added successfully', labour: newLabour },
      };
    } catch (error) {
      console.error('Error inserting labour:', error);
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }

  async deleteLabour(id: string): Promise<{
    status: number;
    data: { message?: string; error?: string; deletedLabour?: labours };
  }> {
    if (!id) {
      return { status: 400, data: { error: 'Missing labour_id' } };
    }

    try {
      const existing = await this.prisma.labours.findUnique({
        where: { labour_id: Number(id) },
      });

      if (!existing) {
        return { status: 404, data: { error: 'Labour not found' } };
      }

      await this.prisma.labours.delete({ where: { labour_id: Number(id) } });

      return {
        status: 200,
        data: {
          message: 'Labour deleted successfully',
          deletedLabour: existing,
        },
      };
    } catch (error) {
      console.error('Error deleting labour:', error);
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }

  async updateLabour(body: LabourBody): Promise<{
    status: number;
    data: { message?: string; error?: string; updatedLabour?: labours };
  }> {
    const { labour_id } = body;

    if (!labour_id) {
      return { status: 400, data: { error: 'Missing labour_id' } };
    }

    try {
      const labourId = Number(labour_id);
      const existing = await this.prisma.labours.findUnique({
        where: { labour_id: labourId },
      });

      if (!existing) {
        return { status: 404, data: { error: 'Labour not found' } };
      }

      const updateData: Prisma.laboursUpdateInput = {};

      if (body.full_name) updateData.full_name = String(body.full_name);
      if (body.date_of_birth) {
        if (
          typeof body.date_of_birth === 'string' &&
          body.date_of_birth.includes('/')
        ) {
          const parts = body.date_of_birth.split('/');
          if (parts.length === 3)
            updateData.date_of_birth = new Date(
              `${parts[2]}-${parts[1]}-${parts[0]}`,
            );
          else updateData.date_of_birth = new Date(body.date_of_birth);
        } else {
          updateData.date_of_birth = new Date(body.date_of_birth);
        }
      }
      if (body.gender) updateData.gender = String(body.gender);
      if (body.role) updateData.role = String(body.role);
      if (body.contact_number)
        updateData.contact_number = String(body.contact_number);
      if (body.aadhar_card_number)
        updateData.aadhar_card_number = String(body.aadhar_card_number);
      if (body.address_line_1)
        updateData.address_line_1 = String(body.address_line_1);
      if (body.address_line_2)
        updateData.address_line_2 = String(body.address_line_2);
      if (body.city) updateData.city = String(body.city);
      if (body.state) updateData.state = String(body.state);
      if (body.postal_code) updateData.postal_code = String(body.postal_code);
      if (body.ration_card) updateData.ration_card = String(body.ration_card);
      if (body.pan_card) updateData.pan_card = String(body.pan_card);
      if (body.driving_license)
        updateData.driving_license = String(body.driving_license);
      if (body.mnrega_job_card_number)
        updateData.mnrega_job_card_number = String(body.mnrega_job_card_number);
      if (body.bank_account_number)
        updateData.bank_account_number = String(body.bank_account_number);
      if (body.ifsc_code) updateData.ifsc_code = String(body.ifsc_code);
      if (body.bank_name) updateData.bank_name = String(body.bank_name);
      if (body.bank_branch) updateData.bank_branch = String(body.bank_branch);
      if (body.disability_status !== undefined)
        updateData.disability_status = Boolean(body.disability_status);
      if (body.epfo) updateData.epfo = String(body.epfo);
      if (body.esic) updateData.esic = String(body.esic);
      if (body.pm_kisan !== undefined)
        updateData.pm_kisan = Boolean(body.pm_kisan);
      if (body.base_salary !== undefined)
        updateData.base_salary = new Prisma.Decimal(body.base_salary);
      if (body.bonus !== undefined)
        updateData.bonus = new Prisma.Decimal(body.bonus);
      if (body.overtime_pay !== undefined)
        updateData.overtime_pay = new Prisma.Decimal(body.overtime_pay);
      if (body.housing_allowance !== undefined)
        updateData.housing_allowance = new Prisma.Decimal(
          body.housing_allowance,
        );
      if (body.travel_allowance !== undefined)
        updateData.travel_allowance = new Prisma.Decimal(body.travel_allowance);
      if (body.meal_allowance !== undefined)
        updateData.meal_allowance = new Prisma.Decimal(body.meal_allowance);
      if (body.payment_frequency)
        updateData.payment_frequency = String(body.payment_frequency);

      if (Object.keys(updateData).length === 0) {
        return { status: 400, data: { error: 'No fields provided to update' } };
      }

      const updatedLabour = await this.prisma.labours.update({
        where: { labour_id: labourId },
        data: updateData,
      });

      return {
        status: 200,
        data: {
          message: 'Labour updated successfully',
          updatedLabour,
        },
      };
    } catch (error) {
      console.error('Error updating labour:', error);
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.labours.deleteMany({});
      return { message: `Labours table reset for user ${userId}` };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
