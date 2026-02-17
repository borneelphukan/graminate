import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { OtpModule } from './otp/otp.module';
import { PasswordModule } from './password/password.module';
import { AdminModule } from './admin/admin.module';
import { FinanceModule } from './finance/finance.module';
import { CattleModule } from './cattle/cattle.module';
import { CRMModule } from './crm/crm.module';
import { PoultryModule } from './poultry/poultry.module';
import { BeeKeepingModule } from './bee-keeping/bee-keeping.module';
import { EmployeesModule } from './employees/employees.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { LlmModule } from './llm/llm.module';
import { PaymentModule } from './payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    OtpModule,
    CRMModule,
    PoultryModule,
    CattleModule,
    BeeKeepingModule,
    EmployeesModule,
    FinanceModule,
    WarehousesModule,
    PasswordModule,
    AdminModule,
    PaymentModule,
    LlmModule,
    PrismaModule,
  ],
})
export class AppModule {}
