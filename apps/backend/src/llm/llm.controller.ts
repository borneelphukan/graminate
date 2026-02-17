import { Controller, Post, Body } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmDto } from './llm.dto';

@Controller('/api/llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post()
  create(@Body() llmDto: LlmDto) {
    return this.llmService.generateResponse(llmDto);
  }
}
