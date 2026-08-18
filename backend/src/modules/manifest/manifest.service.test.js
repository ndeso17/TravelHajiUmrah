import test from 'node:test';
import assert from 'node:assert/strict';

import ExcelJS from 'exceljs';
import { createManifestService } from './manifest.service.js';
import { ApiError } from '../../lib/api-error.js';

const ROW_JAMAAH = {
  id: 'j-1',
  nomorRegistrasi: 'HU-2026-0001',
  namaLengkap: 'Ahmad Fauzi',
  jenisKelamin: 'LAKI_LAKI',
  noTelp: '0812345678',
  kloter: 'JKG-01',
  statusPaspor: 'VERIFIED',
  statusVisa: 'BELUM',
  statusFoto: 'UPLOAD',
  statusPendaftaran: 'LUNAS',
  paket: { nama: 'Umroh Rajab 2026' },
};

function makeFakeDb(overrides = {}) {
  const db = {
    jamaah: {
      count: async () => 0,
      findMany: async () => [],
      ...(overrides.jamaah ?? {}),
    },
  };
  return db;
}

test('listManifest: kloter wajib → tanpa kloter ApiError 400', async () => {
  const service = createManifestService(makeFakeDb());
  await assert.rejects(
    () => service.listManifest({}),
    (err) => err instanceof ApiError && err.statusCode === 400,
  );
});

test('listManifest: filter kloter eksak + pagination meta', async () => {
  const db = makeFakeDb({
    jamaah: {
      count: async () => 21,
      findMany: async ({ where, skip, take, include }) => {
        assert.equal(where.kloter, 'JKG-01');
        assert.equal(skip, 0);
        assert.equal(take, 10);
        assert.ok(include.paket, 'harus include paket');
        return [ROW_JAMAAH];
      },
    },
  });
  const service = createManifestService(db);
  const hasil = await service.listManifest({ kloter: 'JKG-01', page: 1, limit: 10 });
  assert.equal(hasil.total, 21);
  assert.equal(hasil.totalPages, 3);
  assert.equal(hasil.manifest[0].nomorRegistrasi, 'HU-2026-0001');
  assert.equal(hasil.manifest[0].paket.nama, 'Umroh Rajab 2026');
});

test('exportManifest: menghasilkan buffer XLSX valid dengan header + baris jamaah', async () => {
  const db = makeFakeDb({
    jamaah: { findMany: async () => [ROW_JAMAAH] },
  });
  const service = createManifestService(db);
  const buffer = await service.exportManifest('JKG-01');

  assert.ok(Buffer.isBuffer(buffer), 'hasil harus Buffer');
  assert.equal(buffer.subarray(0, 4).toString('hex'), '504b0304', 'magic bytes ZIP/XLSX');

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.getWorksheet('Manifest');
  assert.ok(ws, 'worksheet Manifest harus ada');
  assert.equal(ws.getCell('A1').value, 'No');
  assert.equal(ws.getCell('B1').value, 'Nomor Registrasi');
  assert.equal(ws.getCell('B2').value, 'HU-2026-0001');
  assert.equal(ws.getCell('C2').value, 'Ahmad Fauzi');
  assert.equal(ws.getCell('F2').value, 'VERIFIED', 'kolom status paspor');
  assert.equal(ws.getCell('I2').value, 'LUNAS', 'kolom status pendaftaran');
  assert.equal(ws.rowCount, 2, 'header + 1 baris data');
});

test('exportManifest: kloter tanpa jamaah → ApiError 404', async () => {
  const service = createManifestService(makeFakeDb());
  await assert.rejects(
    () => service.exportManifest('JKG-99'),
    (err) => err instanceof ApiError && err.statusCode === 404,
  );
});

test('exportManifest: buffer tetap terbaca walau banyak baris (loop data)', async () => {
  const banyak = Array.from({ length: 50 }, (_, i) => ({
    ...ROW_JAMAAH,
    nomorRegistrasi: `HU-2026-${String(i + 1).padStart(4, '0')}`,
    namaLengkap: `Jamaah ${i + 1}`,
  }));
  const db = makeFakeDb({ jamaah: { findMany: async () => banyak } });
  const service = createManifestService(db);
  const buffer = await service.exportManifest('JKG-01');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  assert.equal(wb.getWorksheet('Manifest').rowCount, 51, 'header + 50 baris');
});