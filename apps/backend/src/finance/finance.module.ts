import { Module } from '@nestjs/common';
import { SalesModule } from './sales/sales.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [SalesModule, ExpensesModule],
})
export class FinanceModule {}
