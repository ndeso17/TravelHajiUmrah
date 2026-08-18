import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';

function parseTanggal(value, fallback) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw ApiError.badRequest('Format tanggal tidak valid, gunakan YYYY-MM-DD', undefined, 'TANGGAL_INVALID');
  }
  return date;
}

export function createLaporanService(db = prisma) {
  async function pendapatan({ from, to } = {}) {
    const dari = parseTanggal(from, new Date(0));
    const sampai = parseTanggal(to, new Date());
    sampai.setUTCHours(23, 59, 59, 999);

    const rows = await db.pembayaran.findMany({
      where: { statusVerifikasi: 'DITERIMA', tanggal: { gte: dari, lte: sampai } },
      select: { jumlah: true, metodeBayar: true, tanggal: true, jamaah: { select: { paketId: true } } },
    });

    const total = rows.reduce((sum, row) => sum + Number(row.jumlah), 0);

    const perMetode = {};
    for (const row of rows) {
      perMetode[row.metodeBayar] = (perMetode[row.metodeBayar] ?? 0) + Number(row.jumlah);
    }

    const perPaketMap = new Map();
    for (const row of rows) {
      const key = row.jamaah?.paketId ?? 'TANPA_PAKET';
      perPaketMap.set(key, (perPaketMap.get(key) ?? 0) + Number(row.jumlah));
    }
    const paketIds = [...perPaketMap.keys()].filter((id) => id !== 'TANPA_PAKET');
    const pakets = paketIds.length ? await db.paket.findMany({ where: { id: { in: paketIds } } }) : [];
    const namaPaket = new Map(pakets.map((p) => [p.id, p.nama]));
    const perPaket = [...perPaketMap.entries()].map(([paketId, value]) => ({
      paketId,
      nama: namaPaket.get(paketId) ?? 'Tanpa Paket',
      total: value,
    }));

    const perBulanMap = new Map();
    for (const row of rows) {
      const bulan = row.tanggal.toISOString().slice(0, 7);
      perBulanMap.set(bulan, (perBulanMap.get(bulan) ?? 0) + Number(row.jumlah));
    }
    const perBulan = [...perBulanMap.entries()]
      .map(([bulan, value]) => ({ bulan, total: value }))
      .sort((a, b) => a.bulan.localeCompare(b.bulan));

    return { total, perMetode, perPaket, perBulan };
  }

  async function keberangkatan({ from, to } = {}) {
    const dari = parseTanggal(from, new Date(0));
    const sampai = parseTanggal(to, new Date());
    sampai.setUTCHours(23, 59, 59, 999);

    const jamaah = await db.jamaah.findMany({
      where: { createdAt: { gte: dari, lte: sampai } },
      select: {
        kloter: true,
        statusPaspor: true,
        statusVisa: true,
        statusFoto: true,
        statusPendaftaran: true,
      },
    });

    const rekap = new Map();
    for (const j of jamaah) {
      const kloter = j.kloter ?? 'TANPA_KLOTER';
      if (!rekap.has(kloter)) {
        rekap.set(kloter, { kloter, jumlahJamaah: 0, dokumenLengkap: 0, lunas: 0 });
      }
      const entry = rekap.get(kloter);
      entry.jumlahJamaah++;
      const lengkap = j.statusPaspor === 'VERIFIED' && j.statusVisa === 'VERIFIED' && j.statusFoto === 'VERIFIED';
      if (lengkap) entry.dokumenLengkap++;
      if (j.statusPendaftaran === 'LUNAS') entry.lunas++;
    }

    return [...rekap.values()].sort((a, b) => a.kloter.localeCompare(b.kloter));
  }

  return { pendapatan, keberangkatan };
}

export const laporanService = createLaporanService();