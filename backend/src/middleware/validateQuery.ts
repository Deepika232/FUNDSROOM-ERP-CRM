import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/AppError";

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      (req as any).validatedQuery = parsed;
      next();
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const fieldErrors: Record<string, string[]> = {};
        (error as any).errors.forEach((err: any) => {
          const field = err.path.join(".");
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field].push(err.message);
        });
        throw new AppError("Query validation failed", 400, fieldErrors);
      }
      throw new AppError("Query validation failed", 400);
    }
  };
};
