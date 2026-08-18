import { apiClient } from './client';
import type { Jamaah, ListResponse } from './types';

export type ManifestFilters = {
  readonly kloter: string;
  readonly page?: number;
  readonly limit?: number;
};

export async function fetchManifest(filters: ManifestFilters): Promise<ListResponse<Jamaah>> {
  const { data } = await apiClient.get<ListResponse<Jamaah>>('/manifest', { params: filters });
  return data;
}

export async function exportManifest(kloter: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>('/manifest/export', {
    params: { kloter },
    responseType: 'blob',
  });
  return data;
}
