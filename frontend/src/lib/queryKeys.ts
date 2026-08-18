import type { QrisProvider } from '../api/types';

export type DateRange = {
  readonly from?: string;
  readonly to?: string;
};

export const queryKeys = {
  publik: {
    landing: ['publik', 'landing'] as const,
    me: ['publik', 'me'] as const,
  },
  paket: {
    all: ['paket'] as const,
    list: (filters?: Record<string, unknown>) => ['paket', 'list', filters] as const,
    detail: (id: string) => ['paket', 'detail', id] as const,
  },
  jamaah: {
    all: ['jamaah'] as const,
    list: (filters?: Record<string, unknown>) => ['jamaah', 'list', filters] as const,
    detail: (id: string) => ['jamaah', 'detail', id] as const,
  },
  tagihan: {
    jamaah: (jamaahId: string) => ['tagihan', 'jamaah', jamaahId] as const,
  },
  pembayaran: {
    tagihan: (tagihanId: string) => ['pembayaran', 'tagihan', tagihanId] as const,
    qris: (tagihanId: string, provider: QrisProvider) =>
      ['pembayaran', 'qris', tagihanId, provider] as const,
  },
  manifest: {
    kloter: (kloter: string) => ['manifest', 'kloter', kloter] as const,
  },
  laporan: {
    pendapatan: (range?: DateRange) => ['laporan', 'pendapatan', range] as const,
    keberangkatan: (range?: DateRange) => ['laporan', 'keberangkatan', range] as const,
  },
  settings: {
    qris: ['settings', 'qris'] as const,
  },
} as const;
