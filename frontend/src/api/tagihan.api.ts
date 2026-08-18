import { apiClient } from './client';
import type { SingleResponse, TagihanCicilan } from './types';

export type TagihanSummary = {
  readonly tagihan: readonly TagihanCicilan[];
  readonly totalTagihan: number;
  readonly totalDibayar: number;
  readonly sisa: number;
};

export async function fetchTagihan(jamaahId: string): Promise<TagihanSummary> {
  const { data } = await apiClient.get<SingleResponse<TagihanSummary>>(`/tagihan/${jamaahId}`);
  return data.data;
}

export async function generateTagihan(payload: {
  readonly jamaahId: string;
  readonly totalHarga: number;
  readonly jumlahCicilan: number;
  readonly deadlines?: readonly string[];
  readonly depositMinimal?: number;
}): Promise<readonly TagihanCicilan[]> {
  const { data } = await apiClient.post<SingleResponse<readonly TagihanCicilan[]>>('/tagihan/generate', payload);
  return data.data;
}
