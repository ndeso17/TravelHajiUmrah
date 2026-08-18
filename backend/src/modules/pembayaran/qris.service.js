import qrcode from 'qrcode';
import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';

// CRC-16/CCITT-FALSE: poly 0x1021, init 0xFFFF, tanpa reflect, tanpa xorout.
// Canonical check value: crc16CcittFalse('123456789') === 0x29B1.
export function crc16CcittFalse(str) {
  const bytes = Buffer.from(str, 'utf8');
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

export function parseEmv(raw) {
  const entries = [];
  let i = 0;
  while (i < raw.length) {
    if (i + 4 > raw.length) {
      throw ApiError.badRequest('Struktur EMV tidak valid', undefined, 'EMV_INVALID');
    }
    const tag = raw.slice(i, i + 2);
    const len = Number.parseInt(raw.slice(i + 2, i + 4), 10);
    if (Number.isNaN(len)) {
      throw ApiError.badRequest('Struktur EMV tidak valid', undefined, 'EMV_INVALID');
    }
    const end = i + 4 + len;
    if (end > raw.length) {
      throw ApiError.badRequest('Struktur EMV tidak valid (length melebihi string)', undefined, 'EMV_INVALID');
    }
    entries.push({ tag, payload: raw.slice(i + 4, end) });
    i = end;
  }
  return entries;
}

export function buildEmv(entries) {
  return entries
    .map(({ tag, payload }) => `${tag}${String(payload.length).padStart(2, '0')}${payload}`)
    .join('');
}

export function injectQrisNominal(rawEmv, nominal) {
  const nominalInt = Math.round(Number(nominal));
  if (!Number.isFinite(nominalInt)) {
    throw ApiError.badRequest('Nominal tidak valid', undefined, 'NOMINAL_INVALID');
  }

  const entries = parseEmv(rawEmv).filter((entry) => entry.tag !== '63');
  const rebuilt = entries.map((entry) =>
    entry.tag === '54' ? { ...entry, payload: String(nominalInt) } : entry,
  );

  const qrStringWithoutCrc = buildEmv(rebuilt);
  const crc = crc16CcittFalse(`${qrStringWithoutCrc}6304`)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');

  return { qrString: `${qrStringWithoutCrc}6304${crc}`, crc };
}

export async function generateQrisQr(qrString) {
  return qrcode.toDataURL(qrString, { width: 512, margin: 2 });
}

export function createQrisService(db = prisma) {
  async function getQrisForTagihan(tagihanId, provider = 'dana', scopeJamaahId = null) {
    const tagihan = await db.tagihanCicilan.findUnique({
      where: { id: tagihanId },
      include: { jamaah: true },
    });
    if (!tagihan) throw ApiError.notFound('Tagihan tidak ditemukan');
    if (scopeJamaahId && tagihan.jamaahId !== scopeJamaahId) {
      throw ApiError.forbidden('Akses ditolak');
    }

    const config = await db.sistemConfig.findFirst();
    const normalized = String(provider ?? 'dana').toLowerCase();
    const providerName = normalized === 'gopay' ? 'GOPAY' : 'DANA';
    const raw = normalized === 'gopay' ? config?.qrisGopayString : config?.qrisDanaString;
    if (!raw) {
      throw ApiError.badRequest('QRIS belum dikonfigurasi untuk provider ini', undefined, 'QRIS_NOT_CONFIGURED');
    }

    const nominal = Number(tagihan.jumlah);
    const { qrString } = injectQrisNominal(raw, nominal);
    const qrBase64 = await generateQrisQr(qrString);

    return { qrBase64, nominal, provider: providerName };
  }

  return { getQrisForTagihan };
}

export const qrisService = createQrisService();