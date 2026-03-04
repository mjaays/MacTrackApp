import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/ValidationError';

type ValidationTarget = 'body' | 'query' | 'params';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const targets: ValidationTarget[] = ['body', 'query', 'params'];

      for (const target of targets) {
        const schema = schemas[target];
        if (schema) {
          req[target] = await schema.parseAsync(req[target]);
        }
      }

      next();
    } catch (error: unknown) {
      // Zod v4 uses 'issues' property
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
        const details = zodError.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ValidationError('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
};

// Helper to validate a single schema against body
export const validateBody = (schema: ZodSchema) => validate({ body: schema });

// Helper to validate query params
export const validateQuery = (schema: ZodSchema) => validate({ query: schema });

// Helper to validate URL params
export const validateParams = (schema: ZodSchema) => validate({ params: schema });

export default validate;
