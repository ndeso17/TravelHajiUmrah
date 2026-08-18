import test from 'node:test';
import assert from 'node:assert/strict';

import { createPaketSchema, updatePaketSchema } from './paket.schema.js';
import { createPaketService } from './paket.service.js';

const validPayload = {
  nama: 'Umroh Ramadhan 2026',
  tipe: 'UMROH',
  harga: 25000000,
  kuota: 100,
  tanggalBuka: '2026-01-01T00:00:00.000Z',
  tanggalTutup: '2026-02-01T00:00:00.000Z',
  itinerary: 'Madinah - Mekkah',
  fasilitas: ['Hotel Bintang 5', 'Transportasi'],
};

test('schema: payload valid → parse sukses + default isAktif true', () => {
  const result = createPaketSchema.safeParse(validPayload);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.isAktif, true);
    assert.equal(result.data.tipe, 'UMROH');
  }
});

test('schema: harga negatif → VALIDATION_ERROR', () => {
  const result = createPaketSchema.safeParse({ ...validPayload, harga: -1000 });
  assert.equal(result.success, false);
});

test('schema: tipe tidak dikenal → VALIDATION_ERROR', () => {
  const result = createPaketSchema.safeParse({ ...validPayload, tipe: 'TOUR' });
  assert.equal(result.success, false);
});

test('schema: kuota 0 → VALIDATION_ERROR', () => {
  const result = createPaketSchema.safeParse({ ...validPayload, kuota: 0 });
  assert.equal(result.success, false);
});

test('schema: tanggalTutup sebelum tanggalBuka → VALIDATION_ERROR', () => {
  const result = createPaketSchema.safeParse({
    ...validPayload,
    tanggalBuka: '2026-03-01T00:00:00.000Z',
    tanggalTutup: '2026-02-01T00:00:00.000Z',
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.path[0], 'tanggalTutup');
  }
});

test('schema: update partial hanya nama → sukses', () => {
  const result = updatePaketSchema.safeParse({ nama: 'Umroh Rajab' });
  assert.equal(result.success, true);
});

test('service: listPaket pagination → meta totalPages benar + skip/take benar', async () => {
  const calls = [];
  const fakeDb = {
    paket: {
      findMany: async ({ skip, take }) => {
        calls.push({ skip, take });
        return [{ id: 'p1', nama: 'Paket A' }];
      },
      count: async () => 25,
    },
  };
  const service = createPaketService(fakeDb);
  const result = await service.listPaket({ page: 1, limit: 10 });

  assert.equal(result.data.length, 1);
  assert.deepEqual(result.meta, { page: 1, limit: 10, total: 25, totalPages: 3 });
  assert.deepEqual(calls[0], { skip: 0, take: 10 });
});

test('service: listPaket filter tipe + isAktif diteruskan ke where', async () => {
  const whereCalls = [];
  const fakeDb = {
    paket: {
      findMany: async ({ where }) => {
        whereCalls.push(where);
        return [];
      },
      count: async () => 0,
    },
  };
  const service = createPaketService(fakeDb);
  await service.listPaket({ tipe: 'HAJI', isAktif: 'false' });
  assert.deepEqual(whereCalls[0], { tipe: 'HAJI', isAktif: false });
});