import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';

// Nomor registrasi format HU-YYYY-NNNN — urut per tahun berjalan.
// now bisa di-inject untuk test (tahun berbeda → reset urutan).
export async function generateNomorRegistrasi(db = prisma, now = new Date()) {
  const tahun = now.getFullYear();
  const prefix = `HU-${tahun}-`;
  const count = await db.jamaah.count({ where: { nomorRegistrasi: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

export function createJamaahService(db = prisma) {
  async function listJamaah({ page = 1, limit = 10, q, paketId, statusPendaftaran, kloter } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    const where = {};
    if (q) {
      where.OR = [
        { namaLengkap: { contains: q, mode: 'insensitive' } },
        { nomorRegistrasi: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (paketId) where.paketId = paketId;
    if (statusPendaftaran) where.statusPendaftaran = statusPendaftaran;
    if (kloter) where.kloter = kloter;

    const [data, total] = await Promise.all([
      db.jamaah.findMany({
        where,
        include: { paket: { select: { id: true, nama: true, tipe: true, harga: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      db.jamaah.count({ where }),
    ]);

    return {
      data,
      meta: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  async function getJamaah(id) {
    const jamaah = await db.jamaah.findUnique({
      where: { id },
      include: {
        paket: true,
        tagihan: { orderBy: { urutan: 'asc' } },
        pembayaran: { orderBy: { tanggal: 'desc' } },
        dokumen: { orderBy: { uploadedAt: 'desc' } },
        user: { select: { id: true, email: true } },
      },
    });
    if (!jamaah) throw ApiError.notFound('Jamaah tidak ditemukan');
    return jamaah;
  }

  function ensureDepositValid(tipeSkema, depositMinimal) {
    if (tipeSkema === 'UMROH_DULU_BAYAR_NANTI' && !depositMinimal) {
      throw ApiError.badRequest('depositMinimal wajib untuk skema UMROH_DULU_BAYAR_NANTI', undefined, 'DEPOSIT_REQUIRED');
    }
  }

  async function createJamaah(data) {
    ensureDepositValid(data.tipeSkema, data.depositMinimal);

    const paket = await db.paket.findUnique({ where: { id: data.paketId } });
    if (!paket) throw ApiError.badRequest('Paket tidak ditemukan', undefined, 'PAKET_NOT_FOUND');

    const nomorRegistrasi = await generateNomorRegistrasi(db);
    return db.jamaah.create({ data: { ...data, nomorRegistrasi } });
  }

  async function updateJamaah(id, data) {
    const existing = await db.jamaah.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Jamaah tidak ditemukan');

    const merged = { ...existing, ...data };
    ensureDepositValid(merged.tipeSkema, merged.depositMinimal);

    return db.jamaah.update({ where: { id }, data });
  }

  return { listJamaah, getJamaah, createJamaah, updateJamaah };
}

export const jamaahService = createJamaahService();