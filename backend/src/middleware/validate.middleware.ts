import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../shared/response';

/**
 * Generic Zod validation middleware factory.
 * Validates req.body against the provided schema.
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const errors: Record<string, string[]> = {};

      zodError.errors.forEach((issue) => {
        const path = issue.path.join('.') || 'root';
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });

      sendError(res, 'Validation failed', 400, errors);
      return;
    }

    // Attach parsed (coerced) data back to body
    req.body = result.data;
    next();
  };
}
