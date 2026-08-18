import { apiClient } from './client';
import type { ListResponse, Role, SingleResponse, User } from './types';

export type UserFilters = {
  readonly page?: number;
  readonly limit?: number;
  readonly q?: string;
  readonly role?: Role;
};

export type UserPayload = {
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly password?: string;
  readonly isActive?: boolean;
};

export async function fetchUsers(filters: UserFilters = {}): Promise<ListResponse<User>> {
  const { data } = await apiClient.get<ListResponse<User>>('/users', { params: filters });
  return data;
}

export async function createUser(payload: Required<Pick<UserPayload, 'name' | 'email' | 'role' | 'password'>>): Promise<User> {
  const { data } = await apiClient.post<SingleResponse<User>>('/users', payload);
  return data.data;
}

export async function updateUser(id: string, payload: UserPayload): Promise<User> {
  const { data } = await apiClient.put<SingleResponse<User>>(`/users/${id}`, payload);
  return data.data;
}
