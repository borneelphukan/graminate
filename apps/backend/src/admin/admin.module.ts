import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { JwtStrategy } from '../auth/jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3d' },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, JwtStrategy],
})
export class AdminModule {}
