import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

import { createPublikService } from './publik.service.js';
import { ApiError } from '../../lib/api-error.js';

function makeFakeDb(overrides = {}) {
  const state = { userCreated: null, jamaahCreated: null, jamaahUpdated: null };
  const db = {
    state,
    paket: {
      findUnique: async () => ({ id: 'paket-1', isAktif: true }),
      ...(overrides.paket ?? {}),
    },
    user: {
      findUnique: async () => null,
      create: async ({ data }) => {
        state.userCreated = data;
        return { id: 'user-baru', ...data };
      },
      ...(overrides.user ?? {}),
    },
    jamaah: {
      count: async () => 0,
      findUnique: async ({ where }) => (where.userId ? null : null),
      create: async ({ data }) => {
        state.jamaahCreated = data;
        return { id: 'jamaah-baru', ...data };
      },
      update: async ({ data }) => {
        state.jamaahUpdated = data;
        return { id: 'jamaah-baru', ...data };
      },
      ...(overrides.jamaah ?? {}),
    },
  };
  return db;
}

test('createPublicJamaah: tanpa password → jamaah dibuat tanpa userId', async () => {
  const db = makeFakeDb();
  const service = createPublikService(db);
  const data = {
    paketId: 'paket-1',
    namaLengkap: 'Budi Santoso',
    tempatLahir: 'Jakarta',
    tanggalLahir: new Date('1990-01-01'),
    jenisKelamin: 'LAKI_LAKI',
    alamat: 'Jl. Merdeka 1',
    noTelp: '081234567890',
  };
  const jamaah = await service.createPublicJamaah(data);
  assert.equal(jamaah.nomorRegistrasi, 'HU-2026-0001');
  assert.equal(jamaah.statusPendaftaran, 'MENUNGGU');
  assert.equal(jamaah.userId, null);
  assert.equal(db.state.userCreated, null, 'tidak boleh membuat user tanpa password');
});

test('createPublicJamaah: dengan password → user JAMAAH dibuat + userId ter-link', async () => {
  const db = makeFakeDb();
  const service = createPublikService(db);
  const data = {
    paketId: 'paket-1',
    namaLengkap: 'Siti Aminah',
    email: 'siti@test.id',
    password: 'rahasia123',
    tempatLahir: 'Bandung',
    tanggalLahir: new Date('1992-05-05'),
    jenisKelamin: 'PEREMPUAN',
    alamat: 'Jl. Asia Afrika 10',
    noTelp: '081298765432',
  };
  const jamaah = await service.createPublicJamaah(data);
  assert.equal(jamaah.userId, 'user-baru');
  assert.equal(db.state.userCreated.role, 'JAMAAH');
  assert.equal(db.state.userCreated.name, 'Siti Aminah');
  assert.equal(db.state.userCreated.email, 'siti@test.id');
  assert.notEqual(db.state.userCreated.password, 'rahasia123', 'password harus di-hash');
  assert.ok(await bcrypt.compare('rahasia123', db.state.userCreated.password), 'hash harus cocok');
});

test('createPublicJamaah: email sudah terdaftar → ApiError 400 EMAIL_TERPAKAI', async () => {
  const db = makeFakeDb({
    user: { findUnique: async () => ({ id: 'user-lama' }) },
  });
  const service = createPublikService(db);
  await assert.rejects(
    () =>
      service.createPublicJamaah({
        paketId: 'paket-1',
        namaLengkap: 'Andi',
        email: 'andi@test.id',
        password: 'rahasia123',
        tempatLahir: 'Surabaya',
        tanggalLahir: new Date('1988-08-08'),
        jenisKelamin: 'LAKI_LAKI',
        alamat: 'Jl. Tunjungan 5',
        noTelp: '081312345678',
      }),
    (err) => err instanceof ApiError && err.statusCode === 400 && err.code === 'EMAIL_TERPAKAI',
  );
});

test('createPublicJamaah: paket tidak ditemukan → ApiError 400 PAKET_NOT_FOUND', async () => {
  const db = makeFakeDb({ paket: { findUnique: async () => null } });
  const service = createPublikService(db);
  await assert.rejects(
    () =>
      service.createPublicJamaah({
        paketId: 'paket-x',
        namaLengkap: 'Andi',
        tempatLahir: 'Surabaya',
        tanggalLahir: new Date('1988-08-08'),
        jenisKelamin: 'LAKI_LAKI',
        alamat: 'Jl. Tunjungan 5',
        noTelp: '081312345678',
      }),
    (err) => err instanceof ApiError && err.statusCode === 400 && err.code === 'PAKET_NOT_FOUND',
  );
});

test('createPublicJamaah: paket tidak aktif → ApiError 400 PAKET_TIDAK_AKTIF', async () => {
  const db = makeFakeDb({ paket: { findUnique: async () => ({ id: 'paket-1', isAktif: false }) } });
  const service = createPublikService(db);
  await assert.rejects(
    () =>
      service.createPublicJamaah({
        paketId: 'paket-1',
        namaLengkap: 'Andi',
        tempatLahir: 'Surabaya',
        tanggalLahir: new Date('1988-08-08'),
        jenisKelamin: 'LAKI_LAKI',
        alamat: 'Jl. Tunjungan 5',
        noTelp: '081312345678',
      }),
    (err) => err instanceof ApiError && err.statusCode === 400 && err.code === 'PAKET_TIDAK_AKTIF',
  );
});

test('getMe: jamaah terhubung ke user → mengembalikan jamaah dengan include', async () => {
  const jamaahData = { id: 'j-1', namaLengkap: 'Siti', paket: { id: 'paket-1' }, tagihan: [], pembayaran: [], dokumen: [] };
  const db = makeFakeDb({
    jamaah: {
      count: async () => 0,
      findUnique: async ({ where }) => (where.userId === 'user-1' ? jamaahData : null),
      create: async ({ data }) => data,
      update: async ({ data }) => data,
    },
  });
  const service = createPublikService(db);
  const result = await service.getMe('user-1');
  assert.equal(result.id, 'j-1');
  assert.equal(result.paket.id, 'paket-1');
});

test('getMe: user tanpa jamaah → ApiError 404 NOT_FOUND', async () => {
  const db = makeFakeDb();
  const service = createPublikService(db);
  await assert.rejects(
    () => service.getMe('user-tanpa-jamaah'),
    (err) => err instanceof ApiError && err.statusCode === 404,
  );
});

test('updateMe: update data jamaah sendiri → memanggil jamaah.update', async () => {
  const db = makeFakeDb({
    jamaah: {
      count: async () => 0,
      findUnique: async ({ where }) => (where.userId === 'user-1' ? { id: 'j-1' } : null),
      create: async ({ data }) => data,
      update: async ({ data }) => {
        db.state.jamaahUpdated = data;
        return { id: 'j-1', ...data };
      },
    },
  });
  const service = createPublikService(db);
  const result = await service.updateMe('user-1', { noTelp: '081311122233' });
  assert.equal(db.state.jamaahUpdated.noTelp, '081311122233');
  assert.equal(result.id, 'j-1');
});

test('updateMe: user tanpa jamaah → ApiError 404 NOT_FOUND', async () => {
  const db = makeFakeDb();
  const service = createPublikService(db);
  await assert.rejects(
    () => service.updateMe('user-tanpa-jamaah', { noTelp: '081311122233' }),
    (err) => err instanceof ApiError && err.statusCode === 404,
  );
});
