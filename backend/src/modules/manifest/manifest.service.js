import ExcelJS from 'exceljs';
import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';

const KOLOM_MANIFEST = [
  { header: 'No', key: 'no', width: 5 },
  { header: 'Nomor Registrasi', key: 'nomorRegistrasi', width: 16 },
  { header: 'Nama Lengkap', key: 'namaLengkap', width: 24 },
  { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 14 },
  { header: 'No. Telp', key: 'noTelp', width: 16 },
  { header: 'Paspor', key: 'statusPaspor', width: 12 },
  { header: 'Visa', key: 'statusVisa', width: 12 },
  { header: 'Foto', key: 'statusFoto', width: 12 },
  { header: 'Status Pendaftaran', key: 'statusPendaftaran', width: 20 },
  { header: 'Paket', key: 'paket', width: 20 },
];

export function createManifestService(db = prisma) {
  async function listManifest({ kloter, page = 1, limit = 10 }) {
    if (!kloter) throw ApiError.badRequest('Parameter kloter wajib diisi', undefined, 'KLOTER_REQUIRED');

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const where = { kloter };

    const [total, manifest] = await Promise.all([
      db.jamaah.count({ where }),
      db.jamaah.findMany({
        where,
        orderBy: { nomorRegistrasi: 'asc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        include: { paket: { select: { nama: true, tipe: true } } },
      }),
    ]);

    return { manifest, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async function exportManifest(kloter) {
    if (!kloter) throw ApiError.badRequest('Parameter kloter wajib diisi', undefined, 'KLOTER_REQUIRED');

    const jamaah = await db.jamaah.findMany({
      where: { kloter },
      orderBy: { nomorRegistrasi: 'asc' },
      include: { paket: { select: { nama: true } } },
    });
    if (jamaah.length === 0) {
      throw ApiError.notFound('Tidak ada jamaah pada kloter ini', undefined, 'KLOTER_KOSONG');
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Manifest');
    sheet.columns = KOLOM_MANIFEST;
    jamaah.forEach((j, index) => {
      sheet.addRow({
        no: index + 1,
        nomorRegistrasi: j.nomorRegistrasi,
        namaLengkap: j.namaLengkap,
        jenisKelamin: j.jenisKelamin,
        noTelp: j.noTelp,
        statusPaspor: j.statusPaspor,
        statusVisa: j.statusVisa,
        statusFoto: j.statusFoto,
        statusPendaftaran: j.statusPendaftaran,
        paket: j.paket?.nama ?? '',
      });
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  return { listManifest, exportManifest };
}

export const manifestService = createManifestService();