import { apiClient } from './client';
import type { SingleResponse } from './types';

export type PendapatanLaporan = {
  readonly total: number;
  readonly perMetode: Readonly<Record<string, number>>;
  readonly perPaket: readonly { paketId: string; nama: string; total: number }[];
  readonly perBulan: readonly { bulan: string; total: number }[];
};

export type KeberangkatanRow = {
  readonly kloter: string;
  readonly jumlahJamaah: number;
  readonly dokumenLengkap: number;
  readonly lunas: number;
};

export async function fetchPendapatan(from?: string, to?: string): Promise<PendapatanLaporan> {
  const { data } = await apiClient.get<SingleResponse<PendapatanLaporan>>('/laporan/pendapatan', {
    params: { from, to },
  });
  return data.data;
}

export async function fetchKeberangkatan(from?: string, to?: string): Promise<readonly KeberangkatanRow[]> {
  const { data } = await apiClient.get<SingleResponse<readonly KeberangkatanRow[]>>('/laporan/keberangkatan', {
    params: { from, to },
  });
  return data.data;
}
