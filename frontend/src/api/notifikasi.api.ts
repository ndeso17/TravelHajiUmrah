import { apiClient } from './client';
import type { SingleResponse } from './types';

export type BroadcastPayload = {
  readonly tipe: 'WA' | 'EMAIL';
  readonly pesan: string;
  readonly filter?: {
    readonly paketId?: string;
    readonly kloter?: string;
  };
};

export type BroadcastResult = {
  readonly terkirim: number;
  readonly gagal: number;
};

export async function broadcastNotifikasi(payload: BroadcastPayload): Promise<BroadcastResult> {
  const { data } = await apiClient.post<SingleResponse<BroadcastResult>>('/notifikasi/broadcast', payload);
  return data.data;
}
