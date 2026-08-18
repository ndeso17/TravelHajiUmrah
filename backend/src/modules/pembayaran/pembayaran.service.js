import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';
import { sendEmail } from '../../lib/mailer.js';

const ACTIVE_STATUS = ['MENUNGGU', 'DITERIMA'];

export function createPembayaranService(db = prisma) {
  function buildBelumLunasWhere(jamaahId, excludeTagihanId) {
    const exclude = excludeTagihanId ? { id: { not: excludeTagihanId } } : {};
    return { id: jamaahId, tagihan: { some: { ...exclude, status: { not: 'LUNAS' } } } };
  }

  async function countBelumLunas(jamaahId, excludeTagihanId) {
    return db.jamaah.count({ where: buildBelumLunasWhere(jamaahId, excludeTagihanId) });
  }
  async function listPembayaran({ page = 1, limit = 10, jamaahId, statusVerifikasi, metodeBayar } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    const where = {};
    if (jamaahId) where.jamaahId = jamaahId;
    if (statusVerifikasi) where.statusVerifikasi = statusVerifikasi;
    if (metodeBayar) where.metodeBayar = metodeBayar;

    const [data, total] = await Promise.all([
      db.pembayaran.findMany({
        where,
        include: {
          jamaah: { select: { id: true, namaLengkap: true, nomorRegistrasi: true } },
          tagihan: { select: { urutan: true, status: true } },
        },
        orderBy: { tanggal: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      db.pembayaran.count({ where }),
    ]);

    return {
      data,
      meta: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  async function createPembayaran({ jamaahId, tagihanId, jumlah, metodeBayar, qrisProvider, buktiBayar, tanggal, createdBy }) {
    const jamaah = await db.jamaah.findUnique({ where: { id: jamaahId } });
    if (!jamaah) throw ApiError.notFound('Jamaah tidak ditemukan');

    let tagihan = null;
    if (tagihanId) {
      tagihan = await db.tagihanCicilan.findUnique({ where: { id: tagihanId } });
      if (!tagihan || tagihan.jamaahId !== jamaahId) {
        throw ApiError.badRequest('Tagihan tidak ditemukan untuk jamaah ini', undefined, 'TAGIHAN_NOT_FOUND');
      }
      const active = await db.pembayaran.findFirst({
        where: { tagihanId, statusVerifikasi: { in: ACTIVE_STATUS } },
      });
      if (active) {
        throw ApiError.badRequest('Tagihan sudah memiliki pembayaran aktif', undefined, 'TAGIHAN_SUDAH_DIBAYAR');
      }
    }

    const effectiveJumlah = jumlah ?? (tagihan ? Number(tagihan.jumlah) : null);
    if (!effectiveJumlah) {
      throw ApiError.badRequest('jumlah wajib diisi', undefined, 'JUMLAH_REQUIRED');
    }

    if (metodeBayar === 'QRIS' && !qrisProvider) {
      throw ApiError.badRequest('qrisProvider wajib untuk metode QRIS', undefined, 'QRIS_PROVIDER_REQUIRED');
    }
    if ((metodeBayar === 'QRIS' || metodeBayar === 'TRANSFER') && !buktiBayar) {
      throw ApiError.badRequest('buktiBayar wajib untuk metode QRIS/TRANSFER', undefined, 'BUKTI_REQUIRED');
    }

    const data = {
      jamaahId,
      tagihanId: tagihanId ?? null,
      jumlah: effectiveJumlah,
      metodeBayar,
      qrisProvider: qrisProvider ?? null,
      buktiBayar: buktiBayar ?? null,
      tanggal: tanggal ?? new Date(),
      createdBy,
    };

    const ops = [db.pembayaran.create({ data })];
    if (tagihanId) {
      ops.push(db.tagihanCicilan.update({ where: { id: tagihanId }, data: { status: 'MENUNGGU_VERIFIKASI' } }));
    }

    const [pembayaran] = await db.$transaction(ops);
    return pembayaran;
  }

  async function verifikasiPembayaran(pembayaranId, { action, catatan }, adminId) {
    const pembayaran = await db.pembayaran.findUnique({
      where: { id: pembayaranId },
      include: { tagihan: true, jamaah: true },
    });
    if (!pembayaran) throw ApiError.notFound('Pembayaran tidak ditemukan');
    if (pembayaran.statusVerifikasi !== 'MENUNGGU') {
      throw ApiError.badRequest('Pembayaran sudah diverifikasi', undefined, 'SUDAH_DIVERIFIKASI');
    }

    const now = new Date();
    const ops = [];

    if (action === 'terima') {
      ops.push(
        db.pembayaran.update({
          where: { id: pembayaranId },
          data: { statusVerifikasi: 'DITERIMA', verifiedBy: adminId, verifiedAt: now },
        }),
      );
      if (pembayaran.tagihanId) {
        ops.push(db.tagihanCicilan.update({ where: { id: pembayaran.tagihanId }, data: { status: 'LUNAS' } }));
      }
      // Jika semua tagihan jamaah lunas → status pendaftaran LUNAS
      const belumLunas = await countBelumLunas(pembayaran.jamaahId, pembayaran.tagihanId);
      if (belumLunas === 0) {
        ops.push(db.jamaah.update({ where: { id: pembayaran.jamaahId }, data: { statusPendaftaran: 'LUNAS' } }));
      }
    } else {
      // Tolak: lepas tagihanId (slot @unique) agar jamaah bisa bayar ulang tagihan yang sama
      ops.push(
        db.pembayaran.update({
          where: { id: pembayaranId },
          data: {
            statusVerifikasi: 'DITOLAK',
            catatanRejeksi: catatan ?? null,
            verifiedBy: adminId,
            verifiedAt: now,
            tagihanId: null,
          },
        }),
      );
      if (pembayaran.tagihanId) {
        ops.push(db.tagihanCicilan.update({ where: { id: pembayaran.tagihanId }, data: { status: 'BELUM' } }));
      }
      // Notifikasi email ke jamaah (stub jika SMTP kosong)
      if (pembayaran.jamaah?.email) {
        sendEmail(
          pembayaran.jamaah.email,
          'Pembayaran ditolak',
          `<p>Pembayaran Anda ditolak${catatan ? `: <b>${catatan}</b>` : ''}. Silakan hubungi admin.</p>`,
        ).catch(() => {});
      }
    }

    await db.$transaction(ops);
    return { id: pembayaranId, action };
  }

  async function cashPembayaran({ tagihanId, jumlah, tanggal, catatan, createdBy }) {
    const tagihan = await db.tagihanCicilan.findUnique({ where: { id: tagihanId }, include: { jamaah: true } });
    if (!tagihan) throw ApiError.notFound('Tagihan tidak ditemukan');

    const active = await db.pembayaran.findFirst({
      where: { tagihanId, statusVerifikasi: { in: ACTIVE_STATUS } },
    });
    if (active) throw ApiError.badRequest('Tagihan sudah memiliki pembayaran aktif', undefined, 'TAGIHAN_SUDAH_DIBAYAR');

    const now = new Date();
    const ops = [
      db.pembayaran.create({
        data: {
          jamaahId: tagihan.jamaahId,
          tagihanId,
          jumlah,
          metodeBayar: 'CASH',
          statusVerifikasi: 'DITERIMA',
          verifiedBy: createdBy,
          verifiedAt: now,
          tanggal: tanggal ?? now,
          catatanRejeksi: catatan ?? null,
          createdBy,
        },
      }),
      db.tagihanCicilan.update({ where: { id: tagihanId }, data: { status: 'LUNAS' } }),
    ];

    const belumLunas = await countBelumLunas(tagihan.jamaahId, tagihanId);
    if (belumLunas === 0) {
      ops.push(db.jamaah.update({ where: { id: tagihan.jamaahId }, data: { statusPendaftaran: 'LUNAS' } }));
    }

    const [pembayaran] = await db.$transaction(ops);
    return pembayaran;
  }

  async function getInvoice(pembayaranId, scopeJamaahId = null) {
    const pembayaran = await db.pembayaran.findUnique({
      where: { id: pembayaranId },
      include: {
        jamaah: { include: { paket: true } },
        tagihan: true,
      },
    });
    if (!pembayaran) throw ApiError.notFound('Pembayaran tidak ditemukan');
    if (scopeJamaahId && pembayaran.jamaahId !== scopeJamaahId) {
      throw ApiError.forbidden('Akses ditolak');
    }

    const d = pembayaran.tanggal;
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return {
      nomorInvoice: `INV-${ymd}-${pembayaran.id.slice(-6).toUpperCase()}`,
      pembayaran,
    };
  }

  return { listPembayaran, createPembayaran, verifikasiPembayaran, cashPembayaran, getInvoice };
}

export const pembayaranService = createPembayaranService();