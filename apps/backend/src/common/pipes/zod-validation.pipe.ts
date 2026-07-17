import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema) {}

  transform(value: unknown) {
    if (!this.schema) return value;

    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    throw new BadRequestException({
      message: 'Validation failed',
      errors: result.error.issues.map((issue: ZodError['issues'][number]) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }
}
