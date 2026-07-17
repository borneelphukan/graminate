import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmDto } from './llm.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/request.type';
import { llmSchema } from '@graminate/shared';
import { UseZodSchema } from '@/common/decorators/use-zod-schema.decorator';

@UseGuards(JwtAuthGuard)
@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @UseZodSchema(llmSchema)
  @Post()
  create(@Body() llmDto: LlmDto, @Request() req: RequestWithUser) {
    llmDto.userId = String(req.user.userId!);
    return this.llmService.generateResponse(llmDto);
  }
}
