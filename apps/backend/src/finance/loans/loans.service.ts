import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLoanDto, UpdateLoanDto } from './loans.dto';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createLoanDto: CreateLoanDto) {
    return this.prisma.loans.create({
      data: {
        ...createLoanDto,
        user_id: userId,
        amount: createLoanDto.amount,
        interest_rate: createLoanDto.interest_rate,
        start_date: new Date(createLoanDto.start_date),
        end_date: createLoanDto.end_date ? new Date(createLoanDto.end_date) : null,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.loans.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(loanId: number) {
    const loan = await this.prisma.loans.findUnique({
      where: { loan_id: loanId },
    });
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${loanId} not found`);
    }
    return loan;
  }

  async update(loanId: number, updateLoanDto: UpdateLoanDto) {
    const data: any = { ...updateLoanDto };
    if (updateLoanDto.start_date) data.start_date = new Date(updateLoanDto.start_date);
    if (updateLoanDto.end_date) data.end_date = new Date(updateLoanDto.end_date);

    return this.prisma.loans.update({
      where: { loan_id: loanId },
      data,
    });
  }

  async remove(loanId: number) {
    return this.prisma.loans.delete({
      where: { loan_id: loanId },
    });
  }
}
