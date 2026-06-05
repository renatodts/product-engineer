import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

// SPEC_DEVIATION: tasks.md T5 suggested a global Zod pipe in main.ts. Implemented as a
// reusable per-route pipe instead (`@Body(new ZodValidationPipe(Schema))`).
// Reason: a global pipe cannot know which contract schema applies to each route without
// extra route-metadata plumbing; per-route binding is the idiomatic, type-safe approach and
// still satisfies APP1-006 (every body validated against its shared-contracts Zod schema).

/**
 * Validates a request payload against a Zod schema, returning the parsed value
 * (so defaults/coercions apply) or throwing 400 with the validation issues.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    return result.data;
  }
}
