import { applyDecorators, UsePipes } from '@nestjs/common';
import { ZodObject } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

export interface ZodSchemaMeta {
  partial?: boolean;
}

export function UseZodSchema(schema: ZodObject<any>, options?: ZodSchemaMeta) {
  const resolved = options?.partial ? schema.partial() : schema;
  return applyDecorators(UsePipes(new ZodValidationPipe(resolved)));
}
