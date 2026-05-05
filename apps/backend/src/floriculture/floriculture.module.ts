import { Module } from '@nestjs/common';
import { FloricultureController } from './floriculture.controller';
import { FloricultureService } from './floriculture.service';
import { PrismaModule } from '../prisma/prisma.module';

import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [FloricultureController],
  providers: [FloricultureService],
})
export class FloricultureModule {}
