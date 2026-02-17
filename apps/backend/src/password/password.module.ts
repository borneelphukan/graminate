import { Module } from '@nestjs/common';
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';
import { PasswordRepository } from './password.repository';

@Module({
  controllers: [PasswordController],
  providers: [PasswordService, PasswordRepository],
})
export class PasswordModule {}
