import { apiClient } from './client';
import type {
  Dokumen,
  Jamaah,
  JenisKelamin,
  LandingPayload,
  Paket,
  Pembayaran,
  SingleResponse,
  TagihanCicilan,
} from './types';

export type PublicJamaahInput = {
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
  readonly password?: string;
};

export type MeJamaah = Jamaah & {
  readonly paket?: Paket;
  readonly tagihan?: readonly TagihanCicilan[];
  readonly pembayaran?: readonly Pembayaran[];
  readonly dokumen?: readonly Dokumen[];
};

export type UpdateMePayload = {
  readonly namaLengkap?: string;
  readonly namaAyah?: string | null;
  readonly tempatLahir?: string;
  readonly tanggalLahir?: string;
  readonly jenisKelamin?: JenisKelamin;
  readonly statusPerkawinan?: string | null;
  readonly alamat?: string;
  readonly noTelp?: string;
  readonly email?: string | null;
};

export async function fetchLanding(): Promise<LandingPayload> {
  const { data } = await apiClient.get<SingleResponse<LandingPayload>>('/publik/landing');
  return data.data;
}

export async function fetchHeroVideoToken(): Promise<string> {
  const { data } = await apiClient.get<SingleResponse<{ token: string }>>('/publik/hero-video/token');
  return data.data.token;
}

export function buildHeroVideoUrl(token: string): string {
  return `${apiClient.defaults.baseURL}/publik/hero-video?token=${encodeURIComponent(token)}`;
}

export async function registerPublicJamaah(payload: PublicJamaahInput): Promise<Jamaah> {
  const { data } = await apiClient.post<SingleResponse<Jamaah>>('/publik/jamaah', payload);
  return data.data;
}

export async function fetchMe(): Promise<MeJamaah> {
  const { data } = await apiClient.get<SingleResponse<MeJamaah>>('/publik/me');
  return data.data;
}

export async function updateMe(payload: UpdateMePayload): Promise<Jamaah> {
  const { data } = await apiClient.put<SingleResponse<Jamaah>>('/publik/me', payload);
  return data.data;
}
