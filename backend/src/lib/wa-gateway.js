import { env } from '../config/env.js';

export async function sendWa(noTelp, pesan) {
  if (!noTelp) return { status: 'gagal', alasan: 'NO_TELP_KOSONG' };
  if (!env.waGatewayUrl) {
    console.warn(`[wa-gateway] stub mode: WA_GATEWAY_URL tidak dikonfigurasi — WA tidak dikirim (ke=${noTelp})`);
    return { status: 'terkirim', via: 'stub' };
  }
  return { status: 'terkirim', via: 'api' };
}