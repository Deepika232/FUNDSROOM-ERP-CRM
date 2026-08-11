import type {
  ApiSuccessResponse,
  AuthResponse,
  LoginCredentials,
  User,
} from "../types/auth.types";
import { apiClient } from "./client";

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
    "/auth/login",
    credentials,
  );

  if (!response.data.data) {
    throw new Error("Invalid login response from server");
  }

  return response.data.data;
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<ApiSuccessResponse<{ user: User }>>(
    "/auth/me",
  );

  if (!response.data.data?.user) {
    throw new Error("Invalid profile response from server");
  }

  return response.data.data.user;
}
