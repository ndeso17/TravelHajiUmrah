import test from 'node:test';
import assert from 'node:assert/strict';

import { createDokumenService } from './dokumen.service.js';
import { ApiError } from '../../lib/api-error.js';

function makeFakeDb(overrides = {}) {
  const state = { dokumenCreates: [], dokumenUpdates: [], jamaahUpdates: [] };
  const db = {
    state,
    dokumen: {
      findUnique: async () => null,
      findFirst: async () => null,
      create: async ({ data }) => {
        state.dokumenCreates.push(data);
        return { id: 'd-baru', status: 'UPLOAD', ...data };
      },
      update: async ({ data }) => {
        state.dokumenUpdates.push(data);
        return { id: 'd-1', ...data };
      },
      count: async () => 0,
      findMany: async () => [],
      ...(overrides.dokumen ?? {}),
    },
    jamaah: {
      findUnique: async () => ({ id: 'j-1' }),
      update: async ({ data }) => {
        state.jamaahUpdates.push(data);
        return data;
      },
      ...(overrides.jamaah ?? {}),
    },
  };
  return db;
}

const FILE = { filename: 'j-1-PASPOR-123.pdf', originalname: 'paspor.pdf', size: 2048 };

test('uploadDokumen: file valid → record UPLOAD + statusPaspor jamaah UPLOAD', async () => {
  const db = makeFakeDb();
  const service = createDokumenService(db);
  const hasil = await service.uploadDokumen({ jamaahId: 'j-1', tipe: 'PASPOR', file: FILE });

  assert.equal(hasil.status, 'UPLOAD');
  assert.equal(db.state.dokumenCreates[0].fileUrl, '/uploads/j-1-PASPOR-123.pdf');
  assert.equal(db.state.dokumenCreates[0].fileSize, 2048);
  assert.deepEqual(db.state.jamaahUpdates[0], { statusPaspor: 'UPLOAD' });
});

test('uploadDokumen: tanpa file → ApiError 400', async () => {
  const db = makeFakeDb();
  const service = createDokumenService(db);
  await assert.rejects(
    () => service.uploadDokumen({ jamaahId: 'j-1', tipe: 'VISA', file: undefined }),
    (err) => err instanceof ApiError && err.statusCode === 400,
  );
});

test('uploadDokumen: jamaah tidak ditemukan → ApiError 404', async () => {
  const db = makeFakeDb({ jamaah: { findUnique: async () => null } });
  const service = createDokumenService(db);
  await assert.rejects(
    () => service.uploadDokumen({ jamaahId: 'j-x', tipe: 'FOTO', file: FILE }),
    (err) => err instanceof ApiError && err.statusCode === 404,
  );
});

test('uploadDokumen: tipe tanpa field status di jamaah (KTP) → jamaah tidak di-update', async () => {
  const db = makeFakeDb();
  const service = createDokumenService(db);
  await service.uploadDokumen({ jamaahId: 'j-1', tipe: 'KTP', file: FILE });
  assert.equal(db.state.jamaahUpdates.length, 0);
});

test('verifikasiDokumen VERIFIED: status VERIFIED + verifiedBy/At + statusVisa jamaah VERIFIED', async () => {
  const db = makeFakeDb({
    dokumen: {
      findUnique: async () => ({ id: 'd-1', jamaahId: 'j-1', tipe: 'VISA', status: 'UPLOAD', uploadedAt: new Date('2026-08-01') }),
      findFirst: async () => null,
    },
  });
  const service = createDokumenService(db);
  const hasil = await service.verifikasiDokumen('d-1', { action: 'VERIFIED' }, 'admin-1');

  assert.equal(hasil.status, 'VERIFIED');
  assert.equal(db.state.dokumenUpdates[0].verifiedBy, 'admin-1');
  assert.ok(db.state.dokumenUpdates[0].verifiedAt instanceof Date);
  assert.deepEqual(db.state.jamaahUpdates[0], { statusVisa: 'VERIFIED' });
});

test('verifikasiDokumen REJECTED: catatan tersimpan + statusFoto jamaah REJECTED', async () => {
  const db = makeFakeDb({
    dokumen: {
      findUnique: async () => ({ id: 'd-1', jamaahId: 'j-1', tipe: 'FOTO', status: 'UPLOAD', uploadedAt: new Date('2026-08-01') }),
      findFirst: async () => null,
    },
  });
  const service = createDokumenService(db);
  const hasil = await service.verifikasiDokumen('d-1', { action: 'REJECTED', catatan: 'Foto buram' }, 'admin-1');

  assert.equal(hasil.status, 'REJECTED');
  assert.equal(db.state.dokumenUpdates[0].catatan, 'Foto buram');
  assert.deepEqual(db.state.jamaahUpdates[0], { statusFoto: 'REJECTED' });
});

test('verifikasiDokumen: status bukan UPLOAD → ApiError 400', async () => {
  const db = makeFakeDb({
    dokumen: {
      findUnique: async () => ({ id: 'd-1', jamaahId: 'j-1', tipe: 'PASPOR', status: 'VERIFIED', uploadedAt: new Date() }),
    },
  });
  const service = createDokumenService(db);
  await assert.rejects(
    () => service.verifikasiDokumen('d-1', { action: 'VERIFIED' }, 'admin-1'),
    (err) => err instanceof ApiError && err.statusCode === 400,
  );
});

test('verifikasiDokumen: ada dokumen lebih baru untuk tipe sama → ApiError 400', async () => {
  const db = makeFakeDb({
    dokumen: {
      findUnique: async () => ({ id: 'd-lama', jamaahId: 'j-1', tipe: 'PASPOR', status: 'UPLOAD', uploadedAt: new Date('2026-08-01') }),
      findFirst: async () => ({ id: 'd-baru' }),
    },
  });
  const service = createDokumenService(db);
  await assert.rejects(
    () => service.verifikasiDokumen('d-lama', { action: 'VERIFIED' }, 'admin-1'),
    (err) => err instanceof ApiError && err.statusCode === 400,
  );
});

test('verifikasiDokumen: dokumen tidak ditemukan → ApiError 404', async () => {
  const db = makeFakeDb();
  const service = createDokumenService(db);
  await assert.rejects(
    () => service.verifikasiDokumen('d-x', { action: 'VERIFIED' }, 'admin-1'),
    (err) => err instanceof ApiError && err.statusCode === 404,
  );
});

test('listDokumen: filter jamaahId + pagination totalPages', async () => {
  const db = makeFakeDb({
    dokumen: {
      count: async () => 25,
      findMany: async ({ where, skip, take }) => {
        assert.equal(where.jamaahId, 'j-1');
        assert.equal(skip, 0);
        assert.equal(take, 10);
        return [{ id: 'd-1', tipe: 'PASPOR' }];
      },
    },
  });
  const service = createDokumenService(db);
  const hasil = await service.listDokumen({ jamaahId: 'j-1', page: 1, limit: 10 });
  assert.equal(hasil.total, 25);
  assert.equal(hasil.totalPages, 3);
  assert.equal(hasil.dokumen[0].id, 'd-1');
});