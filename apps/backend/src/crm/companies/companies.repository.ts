import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, companies } from '@prisma/client';

@Injectable()
export class CompaniesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanies(
    id?: string,
    limit?: number,
    offset?: number,
  ): Promise<{
    status: number;
    data: { companies?: companies[]; error?: string };
  }> {
    try {
      let companiesList: companies[];
      if (id !== undefined) {
        if (isNaN(Number(id))) {
          return { status: 400, data: { error: 'Invalid user ID parameter' } };
        }
        companiesList = await this.prisma.companies.findMany({
          where: { user_id: Number(id) },
          orderBy: { created_at: 'desc' },
        });
      } else if (limit !== undefined && offset !== undefined) {
        companiesList = await this.prisma.companies.findMany({
          orderBy: { created_at: 'desc' },
          take: limit,
          skip: offset,
        });
      } else {
        companiesList = await this.prisma.companies.findMany({
          orderBy: { created_at: 'desc' },
        });
      }
      return { status: 200, data: { companies: companiesList } };
    } catch (error) {
      console.error('Error fetching companies', error);
      return { status: 500, data: { error: 'Failed to fetch companies' } };
    }
  }

  async addCompany(body: Partial<companies>): Promise<{
    status: number;
    data: { message?: string; error?: string; company?: companies };
  }> {
    const {
      user_id,
      company_name,
      contact_person,
      email,
      phone_number,
      type,
      address_line_1,
      city,
      state,
      postal_code,
      address_line_2,
      website,
      industry,
    } = body;

    if (
      !user_id ||
      !company_name ||
      !contact_person ||
      !email ||
      !phone_number ||
      !type ||
      !address_line_1 ||
      !city ||
      !state ||
      !postal_code
    ) {
      return { status: 400, data: { error: 'All fields are required' } };
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone_number)) {
      return { status: 400, data: { error: 'Invalid phone number format' } };
    }

    const postalRegex = /^\d{6}$/;
    if (!postalRegex.test(postal_code)) {
      return { status: 400, data: { error: 'Invalid postal code format' } };
    }

    try {
      const existing = await this.prisma.companies.findFirst({
        where: {
          user_id,
          company_name,
        },
      });

      if (existing) {
        return {
          status: 400,
          data: { error: 'Company with this name already exists' },
        };
      }

      const newCompany = await this.prisma.companies.create({
        data: {
          user_id,
          company_name,
          contact_person,
          email,
          phone_number,
          type,
          address_line_1,
          address_line_2: address_line_2 || null,
          city,
          state,
          postal_code,
          website: website || null,
          industry: industry || null,
        },
      });

      return {
        status: 201,
        data: { message: 'Company added successfully', company: newCompany },
      };
    } catch (error) {
      console.error('Failed to add company', error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return {
          status: 400,
          data: { error: 'Company with this name already exists' },
        };
      }
      return { status: 500, data: { error: 'Failed to add company' } };
    }
  }

  async deleteCompany(id?: string): Promise<{
    status: number;
    data: {
      message?: string;
      error?: string;
      company?: companies;
    };
  }> {
    if (!id) {
      return { status: 400, data: { error: 'Company ID is required' } };
    }
    if (isNaN(Number(id))) {
      return { status: 400, data: { error: 'Invalid company ID' } };
    }

    try {
      const companyId = Number(id);
      const existing = await this.prisma.companies.findUnique({
        where: { company_id: companyId },
      });

      if (!existing) {
        return { status: 404, data: { error: 'Company not found' } };
      }

      await this.prisma.companies.delete({ where: { company_id: companyId } });

      return {
        status: 200,
        data: {
          message: 'Company deleted successfully',
          company: existing,
        },
      };
    } catch (error) {
      console.error('Failed to delete company', error);
      return { status: 500, data: { error: 'Failed to delete company' } };
    }
  }

  async updateCompany(body: Partial<companies> & { id?: string }): Promise<{
    status: number;
    data: { message?: string; error?: string; company?: companies };
  }> {
    if (!body.id) {
      return { status: 400, data: { error: 'Company ID is required' } };
    }
    if (isNaN(Number(body.id))) {
      return { status: 400, data: { error: 'Invalid company ID' } };
    }

    try {
      const companyId = Number(body.id);
      const existing = await this.prisma.companies.findUnique({
        where: { company_id: companyId },
      });

      if (!existing) {
        return { status: 404, data: { error: 'Company not found' } };
      }

      const updatedCompany = await this.prisma.companies.update({
        where: { company_id: companyId },
        data: {
          company_name: body.company_name,
          contact_person: body.contact_person,
          email: body.email,
          phone_number: body.phone_number,
          type: body.type,
          address_line_1: body.address_line_1,
          address_line_2: body.address_line_2 || null,
          city: body.city,
          state: body.state,
          postal_code: body.postal_code,
          website: body.website || null,
          industry: body.industry || null,
        },
      });

      return {
        status: 200,
        data: {
          message: 'Company updated successfully',
          company: updatedCompany,
        },
      };
    } catch (error) {
      console.error('Failed to update company', error);
      return { status: 500, data: { error: 'Failed to update company' } };
    }
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    try {
      await this.prisma.companies.deleteMany({});
      return { message: `Companies table reset for user ${userId}` };
    } catch (error) {
      console.error('Failed to reset companies table', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
