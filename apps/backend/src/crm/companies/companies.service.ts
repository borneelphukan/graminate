import { Injectable } from '@nestjs/common';
import { CompaniesRepository } from './companies.repository';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async getCompanies(id?: string, limit?: number, offset?: number) {
    return this.companiesRepository.getCompanies(id, limit, offset);
  }

  async addCompany(body: any) {
    return this.companiesRepository.addCompany(body);
  }

  async deleteCompany(id?: string) {
    return this.companiesRepository.deleteCompany(id);
  }

  async updateCompany(body: any) {
    return this.companiesRepository.updateCompany(body);
  }

  async resetTable(userId: number) {
    return this.companiesRepository.resetTable(userId);
  }
}
