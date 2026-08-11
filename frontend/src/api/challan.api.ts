import type { ApiSuccessResponse } from "../types/auth.types";
import type {
  Challan,
  ChallanCreateInput,
  ChallanListResponse,
  ChallanQuery,
  ChallanUpdateInput,
} from "../types/challan.types";
import { apiClient } from "./client";

export async function getChallans(
  query: ChallanQuery = {},
): Promise<ChallanListResponse> {
  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.customerId) params.append("customerId", query.customerId);
  if (query.status) params.append("status", query.status);
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());

  const response = await apiClient.get<ApiSuccessResponse<ChallanListResponse>>(
    `/challans?${params.toString()}`,
  );
  if (!response.data.data) throw new Error("Invalid challans response");
  return response.data.data;
}

export async function getChallanById(id: string): Promise<Challan> {
  const response = await apiClient.get<ApiSuccessResponse<Challan>>(
    `/challans/${id}`,
  );
  if (!response.data.data) throw new Error("Invalid challan response");
  return response.data.data;
}

export async function createChallan(
  input: ChallanCreateInput,
): Promise<Challan> {
  const response = await apiClient.post<ApiSuccessResponse<Challan>>(
    "/challans",
    input,
  );
  if (!response.data.data) throw new Error("Invalid challan response");
  return response.data.data;
}

export async function updateChallan(
  id: string,
  input: ChallanUpdateInput,
): Promise<Challan> {
  const response = await apiClient.put<ApiSuccessResponse<Challan>>(
    `/challans/${id}`,
    input,
  );
  if (!response.data.data) throw new Error("Invalid challan response");
  return response.data.data;
}

export async function confirmChallan(id: string): Promise<Challan> {
  const response = await apiClient.post<ApiSuccessResponse<Challan>>(
    `/challans/${id}/confirm`,
  );
  if (!response.data.data) throw new Error("Invalid challan response");
  return response.data.data;
}

export async function cancelChallan(id: string): Promise<Challan> {
  const response = await apiClient.post<ApiSuccessResponse<Challan>>(
    `/challans/${id}/cancel`,
  );
  if (!response.data.data) throw new Error("Invalid challan response");
  return response.data.data;
}
