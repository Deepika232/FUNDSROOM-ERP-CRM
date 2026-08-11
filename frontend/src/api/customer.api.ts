import type { ApiSuccessResponse } from "../types/auth.types";
import type {
  Customer,
  CustomerCreateInput,
  CustomerListResponse,
  CustomerQuery,
  CustomerUpdateInput,
} from "../types/customer.types";
import { apiClient } from "./client";

export async function getCustomers(
  query: CustomerQuery = {},
): Promise<CustomerListResponse> {
  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.customerType) params.append("customerType", query.customerType);
  if (query.status) params.append("status", query.status);
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());

  const response = await apiClient.get<ApiSuccessResponse<CustomerListResponse>>(
    `/customers?${params.toString()}`,
  );

  if (!response.data.data) {
    throw new Error("Invalid customers response from server");
  }

  return response.data.data;
}

export async function getCustomerById(id: string): Promise<Customer> {
  const response = await apiClient.get<ApiSuccessResponse<Customer>>(
    `/customers/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Invalid customer response from server");
  }

  return response.data.data;
}

export async function createCustomer(
  input: CustomerCreateInput,
): Promise<Customer> {
  const response = await apiClient.post<ApiSuccessResponse<Customer>>(
    "/customers",
    input,
  );

  if (!response.data.data) {
    throw new Error("Invalid customer response from server");
  }

  return response.data.data;
}

export async function updateCustomer(
  id: string,
  input: CustomerUpdateInput,
): Promise<Customer> {
  const response = await apiClient.put<ApiSuccessResponse<Customer>>(
    `/customers/${id}`,
    input,
  );

  if (!response.data.data) {
    throw new Error("Invalid customer response from server");
  }

  return response.data.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}
