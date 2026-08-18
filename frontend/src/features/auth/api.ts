import axios from 'axios';
import { apiClient } from '../../api/client';
import type { AuthUser, LoginCredentials, SingleResponse } from '../../api/types';

type AuthPayload = {
  readonly user: AuthUser;
  readonly accessToken: string;
};

export async function login(credentials: LoginCredentials): Promise<AuthPayload> {
  const { data } = await apiClient.post<SingleResponse<AuthPayload>>('/auth/login', credentials);
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function refresh(): Promise<AuthPayload> {
  const { data } = await axios.post<SingleResponse<AuthPayload>>(
    `${import.meta.env.VITE_API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  return data.data;
}
