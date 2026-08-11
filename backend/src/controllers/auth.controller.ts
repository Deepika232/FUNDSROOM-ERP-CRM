import { Request, Response } from "express";
import { ApiSuccessResponse } from "../types/api.types";
import { AuthResponse } from "../types/auth.types";
import * as authService from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result: AuthResponse = await authService.registerUser(req.body);

  const response: ApiSuccessResponse<AuthResponse> = {
    success: true,
    message: "Registration successful",
    data: result,
  };

  res.status(201).json(response);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result: AuthResponse = await authService.loginUser(req.body);

  const response: ApiSuccessResponse<AuthResponse> = {
    success: true,
    message: "Login successful",
    data: result,
  };

  res.status(200).json(response);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.id);

  const response: ApiSuccessResponse<{ user: typeof user }> = {
    success: true,
    message: "Profile fetched successfully",
    data: { user },
  };

  res.status(200).json(response);
});

export const adminCheck = asyncHandler(async (_req: Request, res: Response) => {
  const response: ApiSuccessResponse = {
    success: true,
    message: "Admin access granted",
  };

  res.status(200).json(response);
});
