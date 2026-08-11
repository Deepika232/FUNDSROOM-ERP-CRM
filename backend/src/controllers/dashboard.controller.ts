import { Request, Response } from "express";
import { ApiSuccessResponse } from "../types/api.types";
import * as dashboardService from "../services/dashboard.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getDashboardSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await dashboardService.getDashboardSummary();
  const response: ApiSuccessResponse<typeof summary> = {
    success: true,
    message: "Dashboard summary retrieved successfully",
    data: summary,
  };
  res.status(200).json(response);
});
