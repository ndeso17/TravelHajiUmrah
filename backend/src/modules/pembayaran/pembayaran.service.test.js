import test from 'node:test';
import assert from 'node:assert/strict';

import { createPembayaranService } from './pembayaran.service.js';
import { ApiError } from '../../lib/api-error.js';

function makeFakeDb(overrides = {}) {
  const state = { updates: [], jamaahUpdates: [], tagihanUpdates: [], creates: [] };
  const db = {
    state,
    pembayaran: {
      findUnique: async () => null,
      findFirst: async () => null,
      create: async ({ data }) => {
        state.creates.push(data);
        return { id: 'p-baru', ...data };
      },
      update: async ({ data }) => {
        state.updates.push(data);
        return data;
      },
      ...(overrides.pembayaran ?? {}),
    },
    tagihanCicilan: {
      findUnique: async () => null,
      update: async ({ data }) => {
        state.tagihanUpdates.push(data);
        return data;
      },
      ...(overrides.tagihanCicilan ?? {}),
    },
    jamaah: {
      findUnique: async () => ({ id: 'j-1', email: null }),
      update: async ({ data }) => {
        state.jamaahUpdates.push(data);
        return data;
      },
      count: async () => 0,
      ...(overrides.jamaah ?? {}),
    },
    $transaction: async (ops) => ops,
  };
  return db;
}

test('createPembayaran: tagihanId sudah punya pembayaran aktif → ApiError 400', async () => {
  const db = makeFakeDb({
    pembayaran: {
      findFirst: async () => ({ id: 'p-lama', statusVerifikasi: 'MENUNGGU' }),
      findUnique: async () => null,
    },
    tagihanCicilan: { findUnique: async () => ({ id: 't1', jamaahId: 'j-1' }) },
  });
  const service = createPembayaranService(db);
  await assert.rejects(
    () =>
      service.createPembayaran({
        jamaahId: 'j-1',
        tagihanId: 't1',
        jumlah: 25_000_000,
        metodeBayar: 'CASH',
        createdBy: 'admin-1',
      }),
    (err) => err instanceof ApiError && err.statusCode === 400 && err.code === 'TAGIHAN_SUDAH_DIBAYAR',
  );
});

test('verifikasi terima: semua tagihan lunas → statusPendaftaran jamaah jadi LUNAS', async () => {
  const countWheres = [];
  const db = makeFakeDb({
    pembayaran: {
      findUnique: async () => ({
        id: 'p1',
        tagihanId: 't1',
        jamaahId: 'j-1',
        statusVerifikasi: 'MENUNGGU',
        tagihan: { id: 't1', status: 'MENUNGGU_VERIFIKASI' },
      }),
    },
    jamaah: {
      count: async ({ where }) => {
        countWheres.push(where);
        return 0;
      },
    },
  });
  const service = createPembayaranService(db);
  await service.verifikasiPembayaran('p1', { action: 'terima' }, 'admin-1');

  assert.equal(db.state.updates[0].statusVerifikasi, 'DITERIMA');
  assert.equal(db.state.updates[0].verifiedBy, 'admin-1');
  assert.ok(db.state.updates[0].verifiedAt instanceof Date);
  assert.equal(db.state.tagihanUpdates[0].status, 'LUNAS');
  assert.equal(db.state.jamaahUpdates[0].statusPendaftaran, 'LUNAS');
  // Pengecekan "belum lunas" harus MENGECUALIKAN tagihan yang sedang di-LUNAS-kan
  assert.deepEqual(countWheres[0].tagihan.some, { id: { not: 't1' }, status: { not: 'LUNAS' } });
});

test('verifikasi terima: tagihanId null (pembayaran bebas) → tanpa exclusion id', async () => {
  const countWheres = [];
  const db = makeFakeDb({
    pembayaran: {
      findUnique: async () => ({
        id: 'p1',
        tagihanId: null,
        jamaahId: 'j-1',
        statusVerifikasi: 'MENUNGGU',
        tagihan: null,
      }),
    },
    jamaah: {
      count: async ({ where }) => {
        countWheres.push(where);
        return 1;
      },
    },
  });
  const service = createPembayaranService(db);
  await service.verifikasiPembayaran('p1', { action: 'terima' }, 'admin-1');
  assert.equal(countWheres[0].tagihan.some.id, undefined, 'tanpa tagihanId tidak boleh ada filter id');
  assert.equal(db.state.jamaahUpdates.length, 0);
});

test('cash: tagihan terakhir lunas → statusPendaftaran LUNAS', async () => {
  const db = makeFakeDb({
    tagihanCicilan: {
      findUnique: async () => ({ id: 't2', jamaahId: 'j-1', jumlah: 25_000_000 }),
    },
    jamaah: { count: async () => 0 },
  });
  const service = createPembayaranService(db);
  await service.cashPembayaran({ tagihanId: 't2', jumlah: 25_000_000, createdBy: 'admin-1' });

  assert.equal(db.state.creates[0].statusVerifikasi, 'DITERIMA');
  assert.equal(db.state.creates[0].metodeBayar, 'CASH');
  assert.equal(db.state.tagihanUpdates[0].status, 'LUNAS');
  assert.equal(db.state.jamaahUpdates[0].statusPendaftaran, 'LUNAS');
});

test('verifikasi terima: masih ada tagihan belum lunas → statusPendaftaran TIDAK berubah', async () => {
  const db = makeFakeDb({
    pembayaran: {
      findUnique: async () => ({
        id: 'p1',
        tagihanId: 't1',
        jamaahId: 'j-1',
        statusVerifikasi: 'MENUNGGU',
        tagihan: { id: 't1', status: 'MENUNGGU_VERIFIKASI' },
      }),
    },
    jamaah: { count: async () => 2 },
  });
  const service = createPembayaranService(db);
  await service.verifikasiPembayaran('p1', { action: 'terima' }, 'admin-1');

  assert.equal(db.state.jamaahUpdates.length, 0, 'jamaah tidak boleh di-update');
});

test('verifikasi tolak: tagihanId dilepas (null) agar slot unik bebas + tagihan kembali BELUM', async () => {
  const db = makeFakeDb({
    pembayaran: {
      findUnique: async () => ({
        id: 'p1',
        tagihanId: 't1',
        jamaahId: 'j-1',
        statusVerifikasi: 'MENUNGGU',
        tagihan: { id: 't1', status: 'MENUNGGU_VERIFIKASI' },
      }),
    },
  });
  const service = createPembayaranService(db);
  await service.verifikasiPembayaran('p1', { action: 'tolak', catatan: 'Bukti tidak jelas' }, 'admin-1');

  assert.equal(db.state.updates[0].statusVerifikasi, 'DITOLAK');
  assert.equal(db.state.updates[0].tagihanId, null, 'slot @unique tagihanId harus dilepas');
  assert.equal(db.state.updates[0].catatanRejeksi, 'Bukti tidak jelas');
  assert.equal(db.state.tagihanUpdates[0].status, 'BELUM');
});

test('verifikasi: pembayaran sudah DITERIMA → tidak bisa diverifikasi ulang', async () => {
  const db = makeFakeDb({
    pembayaran: {
      findUnique: async () => ({
        id: 'p1',
        tagihanId: 't1',
        jamaahId: 'j-1',
        statusVerifikasi: 'DITERIMA',
        tagihan: null,
      }),
    },
  });
  const service = createPembayaranService(db);
  await assert.rejects(
    () => service.verifikasiPembayaran('p1', { action: 'terima' }, 'admin-1'),
    (err) => err instanceof ApiError && err.statusCode === 400,
  );
});