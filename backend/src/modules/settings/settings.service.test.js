import test from 'node:test';
import assert from 'node:assert/strict';

import { createSettingsService } from './settings.service.js';
import { ApiError } from '../../lib/api-error.js';

function makeFakeDb(overrides = {}) {
  const state = { upserts: [], updates: [] };
  const db = {
    state,
    sistemConfig: {
      findUnique: async () => null,
      upsert: async ({ update, create }) => {
        state.upserts.push({ update, create });
        return { id: 'sistem', ...create };
      },
      update: async ({ data }) => {
        state.updates.push(data);
        return { id: 'sistem', ...data };
      },
      ...(overrides.sistemConfig ?? {}),
    },
  };
  return db;
}

test('getQris: config ada → mengembalikan konfigurasi QRIS', async () => {
  const db = makeFakeDb({
    sistemConfig: {
      findUnique: async () => ({
        id: 'sistem',
        qrisDanaString: '000201...',
        qrisGopayString: '000201...',
        qrisDefaultProvider: 'DANA',
        rekeningBank: null,
      }),
    },
  });
  const service = createSettingsService(db);
  const hasil = await service.getQris();
  assert.equal(hasil.qrisDanaString, '000201...');
  assert.equal(hasil.qrisDefaultProvider, 'DANA');
});

test('getQris: config belum ada → ApiError 404', async () => {
  const service = createSettingsService(makeFakeDb());
  await assert.rejects(
    () => service.getQris(),
    (err) => err instanceof ApiError && err.statusCode === 404,
  );
});

test('updateQris: upsert singleton id sistem + updatedBy admin', async () => {
  const db = makeFakeDb();
  const service = createSettingsService(db);
  const data = {
    qrisDanaString: 'DANA-EMV',
    qrisGopayString: 'GOPAY-EMV',
    qrisDefaultProvider: 'GOPAY',
    rekeningBank: '123456',
    namaRekening: 'HAJI UMROH CENTER',
    namaBank: 'BSI',
  };
  await service.updateQris(data, 'admin-1');

  assert.equal(db.state.upserts[0].create.id, 'sistem');
  assert.equal(db.state.upserts[0].create.qrisDefaultProvider, 'GOPAY');
  assert.equal(db.state.upserts[0].create.updatedBy, 'admin-1');
  assert.equal(db.state.upserts[0].update.updatedBy, 'admin-1');
  assert.equal(db.state.upserts[0].update.rekeningBank, '123456');
});

test('updateQris: tanpa qrisDefaultProvider → default DANA', async () => {
  const db = makeFakeDb();
  const service = createSettingsService(db);
  await service.updateQris({ qrisDanaString: 'A', qrisGopayString: 'B' }, 'admin-1');
  assert.equal(db.state.upserts[0].create.qrisDefaultProvider, 'DANA');
});