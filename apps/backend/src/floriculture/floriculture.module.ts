import { Module } from '@nestjs/common';
import { FloricultureController } from './floriculture.controller';
import { FloricultureService } from './floriculture.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FloricultureController],
  providers: [FloricultureService],
})
export class FloricultureModule {}
