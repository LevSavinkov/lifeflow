import { API_BASE, apiRequest } from "./client";

export type AuthUser = {
  id: number;
  email: string;
};

export type AuthTokenResponse = {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
};

const authFetchInit: RequestInit = { credentials: "include" };

export const register = (email: string, password: string) =>
  apiRequest<AuthTokenResponse>(`${API_BASE}/auth/register`, {
    ...authFetchInit,
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const login = (email: string, password: string) =>
  apiRequest<AuthTokenResponse>(`${API_BASE}/auth/login`, {
    ...authFetchInit,
    method: "POST",
    body: JSON.stringify({ email, password, device_name: "web" }),
  });

export const refresh = () =>
  apiRequest<AuthTokenResponse>(`${API_BASE}/auth/refresh`, {
    ...authFetchInit,
    method: "POST",
    body: JSON.stringify({ device_name: "web" }),
  });

export const me = () =>
  apiRequest<AuthUser>(`${API_BASE}/auth/me`);

export const logout = () =>
  apiRequest<void>(`${API_BASE}/auth/logout`, {
    ...authFetchInit,
    method: "POST",
  });
