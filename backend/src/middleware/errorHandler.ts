import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { ApiErrorResponse } from "../types/api.types";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    const response: ApiErrorResponse = {
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    };
    res.status(err.statusCode).json(response);
    return;
  }

  console.error("Unhandled error:", err);

  const response: ApiErrorResponse = {
    success: false,
    message: "Internal server error",
  };
  res.status(500).json(response);
};
