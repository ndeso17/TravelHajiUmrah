import { apiClient } from './client';
import type { Invoice, ListResponse, MetodeBayar, Pembayaran, QrisProvider, SingleResponse, StatusVerifikasi } from './types';

export type PembayaranFilters = {
  readonly page?: number;
  readonly limit?: number;
  readonly jamaahId?: string;
  readonly statusVerifikasi?: StatusVerifikasi;
  readonly metodeBayar?: MetodeBayar;
};

export type CashPembayaranPayload = {
  readonly tagihanId: string;
  readonly jumlah: number;
  readonly tanggal?: string;
  readonly catatan?: string | null;
};

export type CreatePembayaranPayload = {
  readonly jamaahId: string;
  readonly tagihanId?: string | null;
  readonly jumlah: number;
  readonly metodeBayar: MetodeBayar;
  readonly qrisProvider?: QrisProvider | null;
  readonly buktiBayar?: string | null;
  readonly tanggal?: string;
};

export async function fetchPembayaranList(filters: PembayaranFilters = {}): Promise<ListResponse<Pembayaran>> {
  const { data } = await apiClient.get<ListResponse<Pembayaran>>('/pembayaran', { params: filters });
  return data;
}

export async function createPembayaran(payload: CreatePembayaranPayload): Promise<Pembayaran> {
  const { data } = await apiClient.post<SingleResponse<Pembayaran>>('/pembayaran', payload);
  return data.data;
}

export async function verifikasiPembayaran(
  pembayaranId: string,
  payload: { readonly action: 'terima' | 'tolak'; readonly catatan?: string | null },
): Promise<{ readonly id: string; readonly action: string }> {
  const { data } = await apiClient.post<SingleResponse<{ readonly id: string; readonly action: string }>>(
    `/pembayaran/verifikasi/${pembayaranId}`,
    payload,
  );
  return data.data;
}

export async function cashPembayaran(payload: CashPembayaranPayload): Promise<Pembayaran> {
  const { data } = await apiClient.post<SingleResponse<Pembayaran>>('/pembayaran/cash', payload);
  return data.data;
}

export async function fetchInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.get<SingleResponse<Invoice>>(`/pembayaran/${id}/invoice`);
  return data.data;
}

export type QrisResult = {
  readonly qrBase64: string;
  readonly nominal: number;
  readonly provider: QrisProvider;
};

export async function fetchQris(tagihanId: string, provider: QrisProvider = 'DANA'): Promise<QrisResult> {
  const { data } = await apiClient.get<SingleResponse<QrisResult>>(`/pembayaran/qris/${tagihanId}`, {
    params: { provider: provider.toLowerCase() },
  });
  return data.data;
}

export type UploadBuktiPembayaranPayload = {
  readonly tagihanId: string;
  readonly jumlah: number;
  readonly metodeBayar: Extract<MetodeBayar, 'QRIS' | 'TRANSFER'>;
  readonly file: File;
};

export async function uploadBuktiPembayaran(payload: UploadBuktiPembayaranPayload): Promise<Pembayaran> {
  const form = new FormData();
  form.append('tagihanId', payload.tagihanId);
  form.append('jumlah', String(payload.jumlah));
  form.append('metodeBayar', payload.metodeBayar);
  form.append('buktiBayarFile', payload.file);
  const { data } = await apiClient.post<SingleResponse<Pembayaran>>('/pembayaran/upload-bukti', form);
  return data.data;
}
