import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';

export function createPaketService(db = prisma) {
  async function listPaket({ page = 1, limit = 10, tipe, isAktif, q } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    const where = {};
    if (tipe) where.tipe = tipe;
    if (isAktif !== undefined && isAktif !== null && isAktif !== '') {
      where.isAktif = isAktif === 'true' || isAktif === true;
    }
    if (q) where.nama = { contains: q, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      db.paket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      db.paket.count({ where }),
    ]);

    return {
      data,
      meta: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  async function getPaket(id) {
    const paket = await db.paket.findUnique({ where: { id } });
    if (!paket) throw ApiError.notFound('Paket tidak ditemukan');
    return paket;
  }

  async function createPaket(data) {
    return db.paket.create({ data });
  }

  async function updatePaket(id, data) {
    const existing = await db.paket.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Paket tidak ditemukan');
    return db.paket.update({ where: { id }, data });
  }

  async function deletePaket(id) {
    const existing = await db.paket.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Paket tidak ditemukan');

    const jamaahCount = await db.jamaah.count({ where: { paketId: id } });
    if (jamaahCount > 0) {
      throw ApiError.badRequest('Paket memiliki jamaah terdaftar, tidak bisa dihapus', undefined, 'PAKET_TERPAKAI');
    }

    return db.paket.delete({ where: { id } });
  }

  return { listPaket, getPaket, createPaket, updatePaket, deletePaket };
}

export const paketService = createPaketService();