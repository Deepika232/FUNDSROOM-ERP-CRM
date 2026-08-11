import type { ApiSuccessResponse } from "../types/auth.types";
import type { DashboardSummary } from "../types/dashboard.types";
import { apiClient } from "./client";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<ApiSuccessResponse<DashboardSummary>>(
    "/dashboard/summary",
  );
  if (!response.data.data) throw new Error("Invalid dashboard response");
  return response.data.data;
}
