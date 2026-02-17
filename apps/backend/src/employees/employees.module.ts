import { Module } from '@nestjs/common';
import { LabourModule } from './labour/labour.module';
import { LabourPaymentModule } from './labour_payment/labour_payment.module';

@Module({
  imports: [LabourModule, LabourPaymentModule],
})
export class EmployeesModule {}
