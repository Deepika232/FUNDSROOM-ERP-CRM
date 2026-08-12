import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/auth.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://fundsroom-backend-d99u0rvjq5pc738lm9ag.onrender.com/api";

export const TOKEN_STORAGE_KEY = "fundsroom_auth_token";
export const USER_STORAGE_KEY = "fundsroom_auth_user";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function getApiFieldErrors(
  error: unknown,
): Record<string, string[]> | undefined {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.errors;
  }
  return undefined;
}
