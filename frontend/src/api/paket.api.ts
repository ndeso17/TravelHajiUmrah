import { apiClient } from './client';
import type { ListResponse, Paket, SingleResponse } from './types';

export type PaketFilters = {
  readonly page?: number;
  readonly limit?: number;
  readonly tipe?: string;
  readonly isAktif?: string;
  readonly q?: string;
};

export type PaketPayload = {
  readonly nama: string;
  readonly tipe: 'HAJI' | 'UMROH';
  readonly harga: number;
  readonly kuota: number;
  readonly tanggalBuka: string;
  readonly tanggalTutup: string;
  readonly itinerary?: string | null;
  readonly fasilitas: readonly string[];
  readonly isAktif?: boolean;
};

export async function fetchPaketList(filters: PaketFilters = {}): Promise<ListResponse<Paket>> {
  const { data } = await apiClient.get<ListResponse<Paket>>('/paket', { params: filters });
  return data;
}

export async function fetchPaket(id: string): Promise<Paket> {
  const { data } = await apiClient.get<SingleResponse<Paket>>(`/paket/${id}`);
  return data.data;
}

export async function createPaket(payload: PaketPayload): Promise<Paket> {
  const { data } = await apiClient.post<SingleResponse<Paket>>('/paket', payload);
  return data.data;
}

export async function updatePaket(id: string, payload: Partial<PaketPayload>): Promise<Paket> {
  const { data } = await apiClient.put<SingleResponse<Paket>>(`/paket/${id}`, payload);
  return data.data;
}

export async function deletePaket(id: string): Promise<void> {
  await apiClient.delete(`/paket/${id}`);
}
