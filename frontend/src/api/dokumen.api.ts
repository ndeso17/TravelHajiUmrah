import { apiClient } from './client';
import type { Dokumen, ListResponse, SingleResponse, StatusDokumen, TipeDokumen } from './types';

export type DokumenFilters = {
  readonly page?: number;
  readonly limit?: number;
  readonly jamaahId?: string;
  readonly tipe?: TipeDokumen;
};

export async function fetchDokumenList(filters: DokumenFilters = {}): Promise<ListResponse<Dokumen>> {
  const { data } = await apiClient.get<ListResponse<Dokumen>>('/dokumen', { params: filters });
  return data;
}

export type UploadDokumenPayload = {
  readonly tipe: TipeDokumen;
  readonly file: File;
};

export async function uploadDokumen(payload: UploadDokumenPayload): Promise<Dokumen> {
  const form = new FormData();
  form.append('tipe', payload.tipe);
  form.append('fileDokumen', payload.file);
  const { data } = await apiClient.post<SingleResponse<Dokumen>>('/dokumen/upload', form);
  return data.data;
}

export async function verifikasiDokumen(
  dokumenId: string,
  payload: { readonly action: Extract<StatusDokumen, 'VERIFIED' | 'REJECTED'>; readonly catatan?: string },
): Promise<Dokumen> {
  const { data } = await apiClient.post<SingleResponse<Dokumen>>(`/dokumen/verifikasi/${dokumenId}`, payload);
  return data.data;
}
