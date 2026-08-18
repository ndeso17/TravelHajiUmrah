import test from 'node:test';
import assert from 'node:assert/strict';

import { buildCicilanRows } from './tagihan.service.js';
import { createTagihanService } from './tagihan.service.js';

test('pembagian: 100jt / 4 cicilan → 4 baris urutan 1-4, masing-masing 25jt, total pas', () => {
  const rows = buildCicilanRows(100_000_000, 4);
  assert.equal(rows.length, 4);
  assert.deepEqual(rows.map((r) => r.urutan), [1, 2, 3, 4]);
  assert.ok(rows.every((r) => r.jumlah === 25_000_000));
  assert.equal(rows.reduce((s, r) => s + r.jumlah, 0), 100_000_000);
});

test('pembagian: deposit 30jt + 4 cicilan → baris 1 = 30jt, sisa 70jt dibagi 3, total pas', () => {
  const rows = buildCicilanRows(100_000_000, 4, 30_000_000);
  assert.equal(rows.length, 4);
  assert.equal(rows[0].jumlah, 30_000_000);
  const sisa = rows.slice(1).reduce((s, r) => s + r.jumlah, 0);
  assert.equal(sisa, 70_000_000);
  assert.equal(rows.reduce((s, r) => s + r.jumlah, 0), 100_000_000);
  // sisa 70jt/3 = 23.333.333,33 → pembulatan: dua baris 23.333.333 + satu baris 23.333.334
  const nonDeposit = rows.slice(1).map((r) => r.jumlah).sort();
  assert.deepEqual(nonDeposit, [23_333_333, 23_333_333, 23_333_334]);
});

test('pembagian: 1 cicilan → satu baris = totalHarga', () => {
  const rows = buildCicilanRows(50_000_000, 1);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].jumlah, 50_000_000);
});

test('pembagian: totalHarga string → tetap diproses (coerce)', () => {
  const rows = buildCicilanRows('100000000', 4);
  assert.equal(rows.reduce((s, r) => s + r.jumlah, 0), 100_000_000);
});

test('pembagian: deadlines selaras per urutan, sisanya null', () => {
  const d1 = new Date('2026-03-01T00:00:00Z');
  const d2 = new Date('2026-04-01T00:00:00Z');
  const rows = buildCicilanRows(100_000_000, 4, null, [d1, d2]);
  assert.equal(rows[0].deadline, d1);
  assert.equal(rows[1].deadline, d2);
  assert.equal(rows[2].deadline, null);
  assert.equal(rows[3].deadline, null);
});

test('service: listTagihan menghitung totalTagihan, totalDibayar (hanya DITERIMA), sisa', async () => {
  const fakeDb = {
    jamaah: { findUnique: async () => ({ id: 'j-1' }) },
    tagihanCicilan: {
      findMany: async () => [
        { id: 't1', urutan: 1, jumlah: 25_000_000, pembayaran: { jumlah: 25_000_000, statusVerifikasi: 'DITERIMA' } },
        { id: 't2', urutan: 2, jumlah: 25_000_000, pembayaran: null },
        { id: 't3', urutan: 3, jumlah: 50_000_000, pembayaran: null },
      ],
    },
  };
  const service = createTagihanService(fakeDb);
  const result = await service.listTagihan('j-1');
  assert.equal(result.totalTagihan, 100_000_000);
  assert.equal(result.totalDibayar, 25_000_000);
  assert.equal(result.sisa, 75_000_000);
});