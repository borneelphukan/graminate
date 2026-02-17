import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LlmRepository } from './llm.repository';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [LlmController],
  providers: [LlmService, LlmRepository],
})
export class LlmModule {}
