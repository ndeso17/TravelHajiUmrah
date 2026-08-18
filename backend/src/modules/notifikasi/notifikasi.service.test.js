import test from 'node:test';
import assert from 'node:assert/strict';

import { createNotifikasiService } from './notifikasi.service.js';
import { ApiError } from '../../lib/api-error.js';

function makeJamaah(id, noTelp, email) {
  return { id, namaLengkap: `Jamaah ${id}`, noTelp, email };
}

function makeFakeDb(overrides = {}) {
  const db = {
    jamaah: {
      findMany: async () => [],
      ...(overrides.jamaah ?? {}),
    },
  };
  return db;
}

function makeSenderRecorder() {
  const calls = [];
  let active = 0;
  let maxActive = 0;
  return {
    calls,
    getMaxActive: () => maxActive,
    pengirim: async (tipe, jamaah, pesan) => {
      active++;
      maxActive = Math.max(maxActive, active);
      calls.push({ tipe, jamaahId: jamaah.id, pesan });
      await new Promise((resolve) => setTimeout(resolve, 2));
      active--;
      return { status: 'terkirim' };
    },
  };
}

test('broadcast: pesan kosong → ApiError 400', async () => {
  const service = createNotifikasiService(makeFakeDb(), async () => ({ status: 'terkirim' }));
  await assert.rejects(
    () => service.broadcast({ tipe: 'WA', pesan: '' }),
    (err) => err instanceof ApiError && err.statusCode === 400,
  );
});

test('broadcast WA: filter kloter diteruskan + chunk 10 (12 jamaah, max aktif ≤ 10)', async () => {
  const jamaah = Array.from({ length: 12 }, (_, i) => makeJamaah(`j-${i + 1}`, `081${i}`, `j${i}@test.id`));
  let capturedWhere = null;
  const db = makeFakeDb({
    jamaah: {
      findMany: async ({ where }) => {
        capturedWhere = where;
        return jamaah;
      },
    },
  });
  const recorder = makeSenderRecorder();
  const service = createNotifikasiService(db, recorder.pengirim);

  const hasil = await service.broadcast({ tipe: 'WA', pesan: 'Jadwal manasik berubah', filter: { kloter: 'JKG-01' } });

  assert.equal(capturedWhere.kloter, 'JKG-01');
  assert.equal(capturedWhere.noTelp, undefined, 'noTelp non-nullable di schema → tanpa filter');
  assert.equal(recorder.calls.length, 12, 'semua jamaah dipanggil');
  assert.ok(recorder.getMaxActive() <= 10, `chunk 10 dilanggar (max aktif ${recorder.getMaxActive()})`);
  assert.equal(hasil.terkirim, 12);
  assert.equal(hasil.gagal, 0);
  assert.equal(hasil.total, 12);
});

test('broadcast EMAIL: filter email not null diterapkan', async () => {
  const db = makeFakeDb({
    jamaah: {
      findMany: async ({ where }) => {
        assert.equal(where.email.not, null, 'EMAIL hanya untuk jamaah ber-email');
        return [makeJamaah('j-1', null, 'a@test.id')];
      },
    },
  });
  const service = createNotifikasiService(db, async () => ({ status: 'terkirim' }));
  const hasil = await service.broadcast({ tipe: 'EMAIL', pesan: 'Halo', filter: { paketId: 'p-1' } });
  assert.equal(hasil.terkirim, 1);
});

test('broadcast: sebagian gagal → terkirim/gagal dihitung benar', async () => {
  const jamaah = Array.from({ length: 12 }, (_, i) => makeJamaah(`j-${i + 1}`, `081${i}`, null));
  const db = makeFakeDb({ jamaah: { findMany: async () => jamaah } });
  let callCount = 0;
  const service = createNotifikasiService(db, async () => {
    callCount++;
    return callCount <= 2 ? { status: 'gagal', alasan: 'NO_TELP_KOSONG' } : { status: 'terkirim' };
  });
  const hasil = await service.broadcast({ tipe: 'WA', pesan: 'Pesan' });
  assert.equal(hasil.terkirim, 10);
  assert.equal(hasil.gagal, 2);
});

test('broadcast: sender melempar error → dihitung gagal (allSettled)', async () => {
  const db = makeFakeDb({
    jamaah: { findMany: async () => [makeJamaah('j-1', '0811', null), makeJamaah('j-2', '0812', null)] },
  });
  const service = createNotifikasiService(db, async () => {
    throw new Error('gateway down');
  });
  const hasil = await service.broadcast({ tipe: 'WA', pesan: 'Pesan' });
  assert.equal(hasil.terkirim, 0);
  assert.equal(hasil.gagal, 2);
});

test('broadcast: tanpa filter → semua jamaah terkirim, total 0 jika tidak ada', async () => {
  const db = makeFakeDb();
  const service = createNotifikasiService(db, async () => ({ status: 'terkirim' }));
  const hasil = await service.broadcast({ tipe: 'WA', pesan: 'Pesan' });
  assert.deepEqual(hasil, { terkirim: 0, gagal: 0, total: 0 });
});