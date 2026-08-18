import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';
import { sendWa } from '../../lib/wa-gateway.js';
import { sendEmail } from '../../lib/mailer.js';

const CHUNK_SIZE = 10;

async function kirimDefault(tipe, jamaah, pesan) {
  if (tipe === 'WA') {
    return sendWa(jamaah.noTelp, pesan);
  }
  const hasil = await sendEmail(jamaah.email, 'Notifikasi Sistem Haji & Umroh', pesan);
  return hasil.ok ? { status: 'terkirim' } : { status: 'gagal' };
}

export function createNotifikasiService(db = prisma, pengirim = kirimDefault) {
  async function broadcast({ tipe, pesan, filter = {} }) {
    if (!pesan) throw ApiError.badRequest('Pesan wajib diisi', undefined, 'PESAN_REQUIRED');

    const where = {};
    if (filter.paketId) where.paketId = filter.paketId;
    if (filter.kloter) where.kloter = filter.kloter;
    if (tipe === 'EMAIL') where.email = { not: null };

    const jamaah = await db.jamaah.findMany({
      where,
      select: { id: true, namaLengkap: true, noTelp: true, email: true },
    });

    let terkirim = 0;
    let gagal = 0;
    for (let i = 0; i < jamaah.length; i += CHUNK_SIZE) {
      const chunk = jamaah.slice(i, i + CHUNK_SIZE);
      const hasil = await Promise.allSettled(chunk.map((j) => pengirim(tipe, j, pesan)));
      for (const h of hasil) {
        if (h.status === 'fulfilled' && h.value?.status === 'terkirim') terkirim++;
        else gagal++;
      }
    }

    return { terkirim, gagal, total: jamaah.length };
  }

  return { broadcast };
}

export const notifikasiService = createNotifikasiService();