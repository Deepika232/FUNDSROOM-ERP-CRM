import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { parseOrThrow } from "../utils/validation";

export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    req.body = parseOrThrow(schema, req.body);
    next();
  });
