import type { ApiSuccessResponse } from "../types/auth.types";
import type {
  Product,
  ProductCreateInput,
  ProductListResponse,
  ProductQuery,
  ProductUpdateInput,
} from "../types/product.types";
import { apiClient } from "./client";

export async function getProducts(
  query: ProductQuery = {},
): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.category) params.append("category", query.category);
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());

  const response = await apiClient.get<ApiSuccessResponse<ProductListResponse>>(
    `/products?${params.toString()}`,
  );

  if (!response.data.data) {
    throw new Error("Invalid products response from server");
  }

  return response.data.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await apiClient.get<ApiSuccessResponse<Product>>(
    `/products/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Invalid product response from server");
  }

  return response.data.data;
}

export async function createProduct(
  input: ProductCreateInput,
): Promise<Product> {
  const response = await apiClient.post<ApiSuccessResponse<Product>>(
    "/products",
    input,
  );

  if (!response.data.data) {
    throw new Error("Invalid product response from server");
  }

  return response.data.data;
}

export async function updateProduct(
  id: string,
  input: ProductUpdateInput,
): Promise<Product> {
  const response = await apiClient.put<ApiSuccessResponse<Product>>(
    `/products/${id}`,
    input,
  );

  if (!response.data.data) {
    throw new Error("Invalid product response from server");
  }

  return response.data.data;
}
