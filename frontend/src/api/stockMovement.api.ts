import type { ApiSuccessResponse } from "../types/auth.types";
import type {
  StockMovement,
  StockMovementCreateInput,
  StockMovementListResponse,
  StockMovementQuery,
} from "../types/stockMovement.types";
import { apiClient } from "./client";

export async function getStockMovements(
  query: StockMovementQuery = {},
): Promise<StockMovementListResponse> {
  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.productId) params.append("productId", query.productId);
  if (query.movementType) params.append("movementType", query.movementType);
  if (query.category) params.append("category", query.category);
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());

  const response = await apiClient.get<ApiSuccessResponse<StockMovementListResponse>>(
    `/stock-movements?${params.toString()}`,
  );

  if (!response.data.data) {
    throw new Error("Invalid stock movements response from server");
  }

  return response.data.data;
}

export async function createStockMovement(
  input: StockMovementCreateInput,
): Promise<StockMovement> {
  const response = await apiClient.post<ApiSuccessResponse<StockMovement>>(
    "/stock-movements",
    input,
  );

  if (!response.data.data) {
    throw new Error("Invalid stock movement response from server");
  }

  return response.data.data;
}
