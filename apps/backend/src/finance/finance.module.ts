import { Module } from '@nestjs/common';
import { SalesModule } from './sales/sales.module';
import { ExpensesModule } from './expenses/expenses.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [SalesModule, ExpensesModule, LoansModule],
})
export class FinanceModule {}
