import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';

// Logika murni pembagian cicilan (diuji unit — lihat tagihan.service.test.js).
// Aturan: depositMinimal (opsional) → cicilan ke-1 = deposit, sisa dibagi rata
// dengan pembulatan integer sehingga TOTAL SELALU PAS dengan totalHarga.
export function buildCicilanRows(totalHarga, jumlahCicilan, depositMinimal = null, deadlines = []) {
  const total = Math.round(Number(totalHarga));
  const n = Math.max(1, Math.round(Number(jumlahCicilan)));
  const deposit = depositMinimal != null && depositMinimal !== '' ? Math.round(Number(depositMinimal)) : null;

  const rows = [];

  if (deposit !== null) {
    rows.push({ urutan: 1, jumlah: deposit, deadline: deadlines[0] ?? null });
    const sisa = total - deposit;
    const sisaCicilan = n - 1;
    if (sisa > 0 && sisaCicilan > 0) {
      const base = Math.floor(sisa / sisaCicilan);
      const remainder = sisa - base * sisaCicilan;
      for (let i = 0; i < sisaCicilan; i++) {
        rows.push({
          urutan: i + 2,
          jumlah: base + (i >= sisaCicilan - remainder ? 1 : 0),
          deadline: deadlines[i + 1] ?? null,
        });
      }
    }
    return rows;
  }

  const base = Math.floor(total / n);
  const remainder = total - base * n;
  for (let i = 0; i < n; i++) {
    rows.push({
      urutan: i + 1,
      jumlah: base + (i >= n - remainder ? 1 : 0),
      deadline: deadlines[i] ?? null,
    });
  }
  return rows;
}

export function createTagihanService(db = prisma) {
  async function generateTagihan({ jamaahId, totalHarga, jumlahCicilan, deadlines = [], depositMinimal = null }) {
    const jamaah = await db.jamaah.findUnique({ where: { id: jamaahId } });
    if (!jamaah) throw ApiError.notFound('Jamaah tidak ditemukan');

    const rows = buildCicilanRows(totalHarga, jumlahCicilan, depositMinimal, deadlines);

    // Hapus tagihan lama (pembayaran terkait di-SetNull oleh FK) lalu buat baru
    await db.$transaction([
      db.tagihanCicilan.deleteMany({ where: { jamaahId } }),
      db.tagihanCicilan.createMany({
        data: rows.map((r) => ({ jamaahId, urutan: r.urutan, jumlah: r.jumlah, deadline: r.deadline })),
      }),
    ]);

    return { jumlahCicilan: rows.length, total: rows.reduce((s, r) => s + r.jumlah, 0) };
  }

  async function listTagihan(jamaahId) {
    const jamaah = await db.jamaah.findUnique({ where: { id: jamaahId } });
    if (!jamaah) throw ApiError.notFound('Jamaah tidak ditemukan');

    const tagihan = await db.tagihanCicilan.findMany({
      where: { jamaahId },
      orderBy: { urutan: 'asc' },
      include: { pembayaran: { where: { statusVerifikasi: 'DITERIMA' } } },
    });

    const totalTagihan = tagihan.reduce((sum, t) => sum + Number(t.jumlah), 0);
    const totalDibayar = tagihan.reduce((sum, t) => sum + (t.pembayaran ? Number(t.pembayaran.jumlah) : 0), 0);

    return { tagihan, totalTagihan, totalDibayar, sisa: totalTagihan - totalDibayar };
  }

  return { generateTagihan, listTagihan };
}

export const tagihanService = createTagihanService();