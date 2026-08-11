import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { getJwtSecret } from "../config/env";
import { AppError } from "../utils/AppError";
import { JwtPayload } from "../types/auth.types";
import { asyncHandler } from "../utils/asyncHandler";

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    try {
      const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role as Role,
        name: decoded.name,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Token expired", 401);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid token", 401);
      }

      throw error;
    }
  },
);
