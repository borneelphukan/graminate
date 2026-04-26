import { Module } from '@nestjs/common';
import { ContactsModule } from './contacts/contacts.module';
import { CompaniesModule } from './companies/companies.module';
import { ContractsModule } from './contracts/contracts.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ContactsModule,
    CompaniesModule,
    ContractsModule,
    ReceiptsModule,
    TasksModule,
  ],
})
export class CRMModule {}
