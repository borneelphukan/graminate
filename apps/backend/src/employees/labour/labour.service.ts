import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class LabourService {
  constructor(private readonly prisma: PrismaService) {}
  async getLabours(userId: string) {
    if (!userId || isNaN(Number(userId))) {
      return {
        status: 400,
        data: { error: 'Invalid or missing id parameter' },
      };
    }

    try {
      const labours = await this.prisma.labours.findMany({
        where: { user_id: Number(userId) },
        orderBy: { created_at: 'desc' },
      });

      if (labours.length === 0) {
        return {
          status: 404,
          data: { error: 'No labour records found for this user' },
        };
      }

      return { status: 200, data: { labours } };
    } catch (error) {
      console.error('Error fetching labour:', error);
      return { status: 500, data: { error: 'Internal Server Error' } };
    }
  }

  async addLabour(body: any) {
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
      // Manual DOB formatting logic preserved implicitly by using new Date?
      // Old code did split/reverse/join on `date_of_birth` which implies DD/MM/YYYY.
      // But we need a Date object. `new Date('YYYY-MM-DD')` is robust.
      // If input is DD/MM/YYYY, `new Date` might fail.
      // I'll replicate the split logic to ensure correct Date object creation if string provided.
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
          user_id,
          full_name,
          date_of_birth: dob,
          gender,
          address_line_1,
          address_line_2,
          city,
          state,
          postal_code,
          contact_number,
          aadhar_card_number,
          role: body.role,
          base_salary: body.base_salary ?? 0.0,
          bonus: body.bonus ?? 0.0,
          overtime_pay: body.overtime_pay ?? 0.0,
          housing_allowance: body.housing_allowance ?? 0.0,
          travel_allowance: body.travel_allowance ?? 0.0,
          meal_allowance: body.meal_allowance ?? 0.0,
          payment_frequency: body.payment_frequency ?? 'Monthly',
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

  async deleteLabour(id: string) {
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

  async updateLabour(body: any) {
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

      const updateData: any = {};

      if (body.full_name) updateData.full_name = body.full_name;
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
      if (body.gender) updateData.gender = body.gender;
      if (body.role) updateData.role = body.role;
      if (body.contact_number) updateData.contact_number = body.contact_number;
      if (body.aadhar_card_number)
        updateData.aadhar_card_number = body.aadhar_card_number;
      if (body.address_line_1) updateData.address_line_1 = body.address_line_1;
      if (body.address_line_2) updateData.address_line_2 = body.address_line_2;
      if (body.city) updateData.city = body.city;
      if (body.state) updateData.state = body.state;
      if (body.postal_code) updateData.postal_code = body.postal_code;
      if (body.ration_card) updateData.ration_card = body.ration_card;
      if (body.pan_card) updateData.pan_card = body.pan_card;
      if (body.driving_license)
        updateData.driving_license = body.driving_license;
      if (body.mnrega_job_card_number)
        updateData.mnrega_job_card_number = body.mnrega_job_card_number;
      if (body.bank_account_number)
        updateData.bank_account_number = body.bank_account_number;
      if (body.ifsc_code) updateData.ifsc_code = body.ifsc_code;
      if (body.bank_name) updateData.bank_name = body.bank_name;
      if (body.bank_branch) updateData.bank_branch = body.bank_branch;
      if (body.disability_status !== undefined)
        updateData.disability_status = body.disability_status;
      if (body.epfo) updateData.epfo = body.epfo;
      if (body.esic) updateData.esic = body.esic;
      if (body.pm_kisan !== undefined) updateData.pm_kisan = body.pm_kisan;
      if (body.base_salary !== undefined)
        updateData.base_salary = body.base_salary;
      if (body.bonus !== undefined) updateData.bonus = body.bonus;
      if (body.overtime_pay !== undefined)
        updateData.overtime_pay = body.overtime_pay;
      if (body.housing_allowance !== undefined)
        updateData.housing_allowance = body.housing_allowance;
      if (body.travel_allowance !== undefined)
        updateData.travel_allowance = body.travel_allowance;
      if (body.meal_allowance !== undefined)
        updateData.meal_allowance = body.meal_allowance;
      if (body.payment_frequency)
        updateData.payment_frequency = body.payment_frequency;

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
      throw new InternalServerErrorException(error.message);
    }
  }
}
