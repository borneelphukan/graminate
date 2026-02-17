import { Injectable } from '@nestjs/common';
import { LlmRepository } from './llm.repository';
import { LlmDto } from './llm.dto';

@Injectable()
export class LlmService {
  constructor(private readonly llmRepository: LlmRepository) {}

  async generateResponse(llmDto: LlmDto) {
    return this.llmRepository.generateResponse(llmDto);
  }
}
