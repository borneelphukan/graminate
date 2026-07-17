import { Injectable } from '@nestjs/common';
import { CreateReceiptDto, UpdateReceiptDto } from './receipts.dto';
import { ReceiptsRepository } from './receipts.repository';

@Injectable()
export class ReceiptsService {
  constructor(private readonly receiptsRepository: ReceiptsRepository) {}

  async getReceipts(userId: number) {
    return this.receiptsRepository.getReceipts(userId);
  }

  async addReceipt(createReceiptDto: CreateReceiptDto) {
    return this.receiptsRepository.addReceipt(createReceiptDto);
  }

  async deleteReceipt(id: number, userId?: number) {
    return this.receiptsRepository.deleteReceipt(id, userId);
  }

  async updateReceipt(updateReceiptDto: UpdateReceiptDto, userId?: number) {
    return this.receiptsRepository.updateReceipt(updateReceiptDto, userId);
  }

  async resetTable(userId: number) {
    return this.receiptsRepository.resetTable(userId);
  }
}
