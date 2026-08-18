import test from 'node:test';
import assert from 'node:assert/strict';

import { createJamaahService, generateNomorRegistrasi } from './jamaah.service.js';
import { ApiError } from '../../lib/api-error.js';

function makeFakeDb(countsByPrefix = {}) {
  return {
    jamaah: {
      count: async ({ where }) => {
        const prefix = where?.nomorRegistrasi?.startsWith ?? '';
        return countsByPrefix[prefix] ?? 0;
      },
    },
    paket: {
      findUnique: async () => ({ id: 'paket-1' }),
    },
  };
}

test('generateNomorRegistrasi: tahun berjalan, urut pertama → HU-2026-0001', async () => {
  const db = makeFakeDb();
  const nomor = await generateNomorRegistrasi(db, new Date('2026-05-01T00:00:00Z'));
  assert.equal(nomor, 'HU-2026-0001');
});

test('generateNomorRegistrasi: count 12 di tahun sama → HU-2026-0013 (padStart 4)', async () => {
  const db = makeFakeDb({ 'HU-2026-': 12 });
  const nomor = await generateNomorRegistrasi(db, new Date('2026-05-01T00:00:00Z'));
  assert.equal(nomor, 'HU-2026-0013');
});

test('generateNomorRegistrasi: tahun berganti → urutan reset HU-2027-0001', async () => {
  const db = makeFakeDb({ 'HU-2026-': 12 });
  const nomor = await generateNomorRegistrasi(db, new Date('2027-01-15T00:00:00Z'));
  assert.equal(nomor, 'HU-2027-0001');
});

test('createJamaah: skema UMROH_DULU_BAYAR_NANTI tanpa depositMinimal → ApiError 400', async () => {
  const service = createJamaahService(makeFakeDb());
  await assert.rejects(
    () =>
      service.createJamaah({
        paketId: 'paket-1',
        namaLengkap: 'Siti Aminah',
        tipeSkema: 'UMROH_DULU_BAYAR_NANTI',
      }),
    (err) => err instanceof ApiError && err.statusCode === 400 && err.code === 'DEPOSIT_REQUIRED',
  );
});

test('createJamaah: skema NORMAL tanpa deposit → sukses + nomor ter-generate', async () => {
  let createdData = null;
  const db = {
    ...makeFakeDb(),
    jamaah: {
      count: async () => 0,
      create: async ({ data }) => {
        createdData = data;
        return { ...data, id: 'j-1' };
      },
    },
  };
  const service = createJamaahService(db);
  const result = await service.createJamaah({
    paketId: 'paket-1',
    namaLengkap: 'Budi Santoso',
    tipeSkema: 'NORMAL',
  });
  assert.equal(result.id, 'j-1');
  assert.match(createdData.nomorRegistrasi, /^HU-2026-\d{4}$/);
});