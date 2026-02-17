import { Injectable } from '@nestjs/common';
import { CreateContractDto, UpdateContractDto } from './contracts.dto';
import { ContractsRepository } from './contracts.repository';

@Injectable()
export class ContractsService {
  constructor(private readonly contractsRepository: ContractsRepository) {}

  async getContracts(userId?: number, page?: number, limit?: number) {
    return this.contractsRepository.getContracts(userId, page, limit);
  }

  async addContract(createContractDto: CreateContractDto) {
    return this.contractsRepository.addContract(createContractDto);
  }

  async deleteContract(id: number) {
    return this.contractsRepository.deleteContract(id);
  }

  async updateContract(updateContractDto: UpdateContractDto) {
    return this.contractsRepository.updateContract(updateContractDto);
  }

  async resetTable(userId: number) {
    return this.contractsRepository.resetTable(userId);
  }
}
