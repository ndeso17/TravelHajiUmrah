import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';
import { generateNomorRegistrasi } from '../jamaah/jamaah.service.js';

export function createPublikService(db = prisma) {
  async function getLanding() {
    const [paketAktif, heroSlides, ArtikelTerbit, ustadzList, testimoniList, partnerLogos, lokasiList] = await Promise.all([
      db.paket.findMany({ where: { isAktif: true }, orderBy: { id: 'desc' }, take: 20 }),
      db.heroSlide.findMany({ where: { isActive: true }, orderBy: { urutan: 'asc' } }),
      db.artikel.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 8 }),
      db.ustadz.findMany({ orderBy: { urutan: 'asc' } }),
      db.testimoni.findMany({ orderBy: { id: 'desc' }, take: 10, include: { paket: { select: { id: true, nama: true, tipe: true } } } }),
      db.partnerLogo.findMany({ orderBy: { urutan: 'asc' } }),
      db.lokasiKantor.findMany({ orderBy: { urutan: 'asc' } }),
    ]);

    return {
      paketAktif,
      heroSlides,
      artikel: ArtikelTerbit,
      ustadz: ustadzList,
      testimoni: testimoniList,
      partner: partnerLogos,
      lokasi: lokasiList,
    };
  }

  async function createPublicJamaah(data) {
    const paket = await db.paket.findUnique({ where: { id: data.paketId } });
    if (!paket) throw ApiError.badRequest('Paket tidak ditemukan', undefined, 'PAKET_NOT_FOUND');
    if (!paket.isAktif) throw ApiError.badRequest('Paket tidak aktif', undefined, 'PAKET_TIDAK_AKTIF');

    const { password, ...jamaahData } = data;
    const nomorRegistrasi = await generateNomorRegistrasi(db);

    let userId = null;
    if (password) {
      const existing = await db.user.findUnique({ where: { email: jamaahData.email } });
      if (existing) {
        throw ApiError.badRequest('Email sudah terdaftar, gunakan email lain', undefined, 'EMAIL_TERPAKAI');
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await db.user.create({
        data: {
          name: jamaahData.namaLengkap,
          email: jamaahData.email,
          password: hashed,
          role: 'JAMAAH',
        },
        select: { id: true },
      });
      userId = user.id;
    }

    const jamaah = await db.jamaah.create({
      data: {
        ...jamaahData,
        nomorRegistrasi,
        statusPendaftaran: 'MENUNGGU',
        userId,
      },
    });
    return jamaah;
  }

  async function getMe(userId) {
    const jamaah = await db.jamaah.findUnique({
      where: { userId },
      include: {
        paket: true,
        tagihan: { orderBy: { urutan: 'asc' } },
        pembayaran: { orderBy: { tanggal: 'desc' } },
        dokumen: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    if (!jamaah) throw ApiError.notFound('Data jamaah tidak ditemukan');
    return jamaah;
  }

  async function updateMe(userId, data) {
    const jamaah = await db.jamaah.findUnique({ where: { userId } });
    if (!jamaah) throw ApiError.notFound('Data jamaah tidak ditemukan');
    return db.jamaah.update({ where: { id: jamaah.id }, data });
  }

  return { getLanding, createPublicJamaah, getMe, updateMe };
}

export const publikService = createPublikService();