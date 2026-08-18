import { apiClient } from './client';
import type { Dokumen, Jamaah, ListResponse, Pembayaran, SingleResponse, TagihanCicilan } from './types';

export type JamaahFilters = {
  readonly page?: number;
  readonly limit?: number;
  readonly q?: string;
  readonly paketId?: string;
  readonly statusPendaftaran?: string;
  readonly kloter?: string;
};

export type JamaahPayload = {
  readonly paketId: string;
  readonly kloter?: string | null;
  readonly namaLengkap: string;
  readonly namaAyah?: string | null;
  readonly tempatLahir: string;
  readonly tanggalLahir: string;
  readonly jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN';
  readonly statusPerkawinan?: string | null;
  readonly alamat: string;
  readonly noTelp: string;
  readonly email?: string | null;
  readonly tipeSkema: 'NORMAL' | 'UMROH_DULU_BAYAR_NANTI';
  readonly depositMinimal?: number | null;
  readonly deadlinePelunasan?: string | null;
};

export type JamaahDetail = Jamaah & {
  readonly tagihan?: readonly TagihanCicilan[];
  readonly pembayaran?: readonly Pembayaran[];
  readonly dokumen?: readonly Dokumen[];
};

export async function fetchJamaahList(filters: JamaahFilters = {}): Promise<ListResponse<Jamaah>> {
  const { data } = await apiClient.get<ListResponse<Jamaah>>('/jamaah', { params: filters });
  return data;
}

export async function fetchJamaah(id: string): Promise<JamaahDetail> {
  const { data } = await apiClient.get<SingleResponse<JamaahDetail>>(`/jamaah/${id}`);
  return data.data;
}

export async function createJamaah(payload: JamaahPayload): Promise<Jamaah> {
  const { data } = await apiClient.post<SingleResponse<Jamaah>>('/jamaah', payload);
  return data.data;
}

export async function updateJamaah(id: string, payload: Partial<JamaahPayload>): Promise<Jamaah> {
  const { data } = await apiClient.put<SingleResponse<Jamaah>>(`/jamaah/${id}`, payload);
  return data.data;
}
