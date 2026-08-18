import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';

const STATUS_FIELD = { PASPOR: 'statusPaspor', VISA: 'statusVisa', FOTO: 'statusFoto' };

export function createDokumenService(db = prisma) {
  async function uploadDokumen({ jamaahId, tipe, file }) {
    if (!file) {
      throw ApiError.badRequest('File dokumen wajib diunggah', undefined, 'FILE_REQUIRED');
    }

    const jamaah = await db.jamaah.findUnique({ where: { id: jamaahId } });
    if (!jamaah) throw ApiError.notFound('Jamaah tidak ditemukan');

    const dokumen = await db.dokumen.create({
      data: {
        jamaahId,
        tipe,
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname,
        fileSize: file.size,
      },
    });

    const statusField = STATUS_FIELD[tipe];
    if (statusField) {
      await db.jamaah.update({ where: { id: jamaahId }, data: { [statusField]: 'UPLOAD' } });
    }

    return dokumen;
  }

  async function verifikasiDokumen(dokumenId, { action, catatan }, adminId) {
    const dokumen = await db.dokumen.findUnique({ where: { id: dokumenId } });
    if (!dokumen) throw ApiError.notFound('Dokumen tidak ditemukan');
    if (dokumen.status !== 'UPLOAD') {
      throw ApiError.badRequest('Dokumen sudah diverifikasi', undefined, 'SUDAH_DIVERIFIKASI');
    }

    const lebihBaru = await db.dokumen.findFirst({
      where: { jamaahId: dokumen.jamaahId, tipe: dokumen.tipe, uploadedAt: { gt: dokumen.uploadedAt } },
    });
    if (lebihBaru) {
      throw ApiError.badRequest('Hanya dokumen terbaru yang dapat diverifikasi', undefined, 'BUKAN_DOKUMEN_TERBARU');
    }

    const status = action === 'VERIFIED' ? 'VERIFIED' : 'REJECTED';
    const updated = await db.dokumen.update({
      where: { id: dokumenId },
      data: {
        status,
        catatan: action === 'REJECTED' ? catatan ?? null : null,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
    });

    const statusField = STATUS_FIELD[dokumen.tipe];
    if (statusField) {
      await db.jamaah.update({ where: { id: dokumen.jamaahId }, data: { [statusField]: status } });
    }

    return updated;
  }

  async function listDokumen({ jamaahId, tipe, page = 1, limit = 10 }) {
    const where = {};
    if (jamaahId) where.jamaahId = jamaahId;
    if (tipe) where.tipe = tipe;

    const [total, dokumen] = await Promise.all([
      db.dokumen.count({ where }),
      db.dokumen.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          jamaah: { select: { id: true, namaLengkap: true, nomorRegistrasi: true } },
        },
      }),
    ]);

    return { dokumen, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  return { uploadDokumen, verifikasiDokumen, listDokumen };
}

export const dokumenService = createDokumenService();