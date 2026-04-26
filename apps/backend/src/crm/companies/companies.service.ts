import { Injectable } from '@nestjs/common';
import { CompaniesRepository } from './companies.repository';
import { companies } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async getCompanies(
    id?: string,
    limit?: number,
    offset?: number,
  ): Promise<{
    status: number;
    data: { companies?: companies[]; error?: string };
  }> {
    return this.companiesRepository.getCompanies(id, limit, offset);
  }

  async addCompany(body: Partial<companies>): Promise<{
    status: number;
    data: { message?: string; error?: string; company?: companies };
  }> {
    return this.companiesRepository.addCompany(body);
  }

  async deleteCompany(id?: string): Promise<{
    status: number;
    data: { message?: string; error?: string; company?: companies };
  }> {
    return this.companiesRepository.deleteCompany(id);
  }

  async updateCompany(
    body: Partial<companies> & { company_id: number },
  ): Promise<{
    status: number;
    data: { message?: string; error?: string; company?: companies };
  }> {
    return this.companiesRepository.updateCompany(body);
  }

  async resetTable(userId: number): Promise<{ message: string }> {
    return this.companiesRepository.resetTable(userId);
  }
}
