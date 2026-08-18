import test from 'node:test';
import assert from 'node:assert/strict';

import { createLaporanService } from './laporan.service.js';
import { ApiError } from '../../lib/api-error.js';

const ROW = {
  jumlah: 25_000_000,
  metodeBayar: 'QRIS',
  tanggal: new Date('2026-08-01T10:00:00Z'),
  jamaah: { paketId: 'p-1' },
};

const PAKET_MAP = [{ id: 'p-1', nama: 'Umroh Rajab 2026' }];

function makeFakeDb(overrides = {}) {
  const db = {
    pembayaran: {
      findMany: async () => [],
      ...(overrides.pembayaran ?? {}),
    },
    jamaah: {
      findMany: async () => [],
      ...(overrides.jamaah ?? {}),
    },
    paket: {
      findMany: async () => PAKET_MAP,
      ...(overrides.paket ?? {}),
    },
  };
  return db;
}

test('pendapatan: total, perMetode, perPaket, perBulan dihitung benar', async () => {
  const db = makeFakeDb({
    pembayaran: {
      findMany: async () => [
        { ...ROW, metodeBayar: 'QRIS' },
        { ...ROW, metodeBayar: 'CASH' },
        { ...ROW, metodeBayar: 'CASH', tanggal: new Date('2026-08-15T10:00:00Z') },
        { ...ROW, metodeBayar: 'TRANSFER', tanggal: new Date('2026-07-05T10:00:00Z') },
      ],
    },
  });
  const service = createLaporanService(db);
  const hasil = await service.pendapatan({ from: '2026-07-01', to: '2026-08-31' });

  assert.equal(hasil.total, 100_000_000);
  assert.deepEqual(hasil.perMetode, { QRIS: 25_000_000, CASH: 50_000_000, TRANSFER: 25_000_000 });
  assert.deepEqual(hasil.perPaket, [{ paketId: 'p-1', nama: 'Umroh Rajab 2026', total: 100_000_000 }]);
  assert.deepEqual(hasil.perBulan, [
    { bulan: '2026-07', total: 25_000_000 },
    { bulan: '2026-08', total: 75_000_000 },
  ]);
});

test('pendapatan: hanya statusVerifikasi DITERIMA + rentang createdAt', async () => {
  let capturedWhere = null;
  const db = makeFakeDb({
    pembayaran: {
      findMany: async ({ where }) => {
        capturedWhere = where;
        return [];
      },
    },
  });
  const service = createLaporanService(db);
  await service.pendapatan({ from: '2026-08-01', to: '2026-08-31' });

  assert.equal(capturedWhere.statusVerifikasi, 'DITERIMA');
  assert.equal(capturedWhere.tanggal.gte.toISOString(), '2026-08-01T00:00:00.000Z');
  assert.equal(capturedWhere.tanggal.lte.toISOString(), '2026-08-31T23:59:59.999Z');
});

test('pendapatan: tanggal tidak valid → ApiError 400', async () => {
  const service = createLaporanService(makeFakeDb());
  await assert.rejects(
    () => service.pendapatan({ from: 'bukan-tanggal' }),
    (err) => err instanceof ApiError && err.statusCode === 400,
  );
});

test('pendapatan: tanpa from/to → rentang default seluruh data', async () => {
  const db = makeFakeDb({
    pembayaran: {
      findMany: async () => [{ ...ROW, metodeBayar: 'CASH' }],
    },
  });
  const service = createLaporanService(db);
  const hasil = await service.pendapatan({});
  assert.equal(hasil.total, 25_000_000);
});

test('keberangkatan: rekap per kloter (jumlah, dokumen lengkap, lunas)', async () => {
  const db = makeFakeDb({
    jamaah: {
      findMany: async () => [
        { kloter: 'JKG-01', statusPaspor: 'VERIFIED', statusVisa: 'VERIFIED', statusFoto: 'VERIFIED', statusPendaftaran: 'LUNAS' },
        { kloter: 'JKG-01', statusPaspor: 'BELUM', statusVisa: 'BELUM', statusFoto: 'UPLOAD', statusPendaftaran: 'LUNAS' },
        { kloter: 'JKG-02', statusPaspor: 'VERIFIED', statusVisa: 'VERIFIED', statusFoto: 'VERIFIED', statusPendaftaran: 'MENUNGGU' },
        { kloter: null, statusPaspor: 'BELUM', statusVisa: 'BELUM', statusFoto: 'BELUM', statusPendaftaran: 'LUNAS' },
      ],
    },
  });
  const service = createLaporanService(db);
  const hasil = await service.keberangkatan({});

  assert.equal(hasil.length, 3);
  const jkg01 = hasil.find((h) => h.kloter === 'JKG-01');
  assert.deepEqual(jkg01, { kloter: 'JKG-01', jumlahJamaah: 2, dokumenLengkap: 1, lunas: 2 });
  const jkg02 = hasil.find((h) => h.kloter === 'JKG-02');
  assert.deepEqual(jkg02, { kloter: 'JKG-02', jumlahJamaah: 1, dokumenLengkap: 1, lunas: 0 });
  const tanpa = hasil.find((h) => h.kloter === 'TANPA_KLOTER');
  assert.deepEqual(tanpa, { kloter: 'TANPA_KLOTER', jumlahJamaah: 1, dokumenLengkap: 0, lunas: 1 });
});