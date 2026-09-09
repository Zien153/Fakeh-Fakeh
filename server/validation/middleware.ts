import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { handleValidationError } from './schemas';

/**
 * Express middleware factory for validating request bodies with Zod
 * Usage: app.post('/endpoint', validateRequest(MySchema), handler)
 */
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      (req as any).validated = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = handleValidationError(error);
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid request body',
        });
      }
    }
  };
}
