import test from 'node:test';
import assert from 'node:assert/strict';

import { crc16CcittFalse, parseEmv, buildEmv, injectQrisNominal, generateQrisQr, createQrisService } from './qris.service.js';
import { ApiError } from '../../lib/api-error.js';

// String EMV realistis (struktur QRIS: tag 2 digit + length 2 digit + payload).
// Expected CRC dihitung dengan implementasi Python independen (cross-check 2 bahasa).
const EMV_BASE =
  '00020101021126630014ID.CO.QRIS.WWW0118936009153030305140000015204531530358032ID52045315530336054061000005802ID5916MORAT MARIT CLUB6010KAB BREBES610552211';

test('crc16CcittFalse: canonical check value 123456789 → 0x29B1 (CRC-16/CCITT-FALSE)', () => {
  assert.equal(crc16CcittFalse('123456789'), 0x29b1);
});

test('crc16CcittFalse: EMV base + literal "6304" → 0x7258 (cross-check Python)', () => {
  assert.equal(crc16CcittFalse(`${EMV_BASE}6304`), 0x7258);
});

test('parseEmv: membaca tag + length + payload dengan urutan benar', () => {
  const entries = parseEmv(EMV_BASE);
  assert.equal(entries[0].tag, '00');
  assert.equal(entries[0].payload, '01');
  assert.equal(entries[5].tag, '54');
  assert.equal(entries[5].payload, '100000');
  assert.equal(entries[7].tag, '59');
  assert.equal(entries[7].payload, 'MORAT MARIT CLUB');
  assert.equal(entries.length, 10);
});

test('buildEmv: rebuild string identik dengan input', () => {
  const entries = parseEmv(EMV_BASE);
  assert.equal(buildEmv(entries), EMV_BASE);
});

test('injectQrisNominal: nominal 100000 → tag 54 diganti, tag 63 baru dengan CRC benar', () => {
  const { qrString, crc } = injectQrisNominal(EMV_BASE, 100000);
  assert.equal(crc, '7258');
  assert.equal(qrString, `${EMV_BASE}63047258`);
  assert.match(qrString, /5406100000/, 'tag 54 payload harus 100000');
});

test('injectQrisNominal: nominal 25000000 → length tag 54 berubah (6→8) + CRC 0533', () => {
  const { qrString, crc } = injectQrisNominal(EMV_BASE, 25000000);
  assert.equal(crc, '0533');
  assert.match(qrString, /540825000000/);
  assert.ok(!qrString.includes('5406'), 'tag 54 lama harus tergantikan');
});

test('injectQrisNominal: nominal string "10000" tanpa desimal → payload integer string', () => {
  const { qrString } = injectQrisNominal(EMV_BASE, '10000');
  assert.match(qrString, /540510000/);
});

test('injectQrisNominal: tag 63 lama dihapus lalu diganti (tidak dobel)', () => {
  const simpleBase = '000201010211540410005802ID5905TESTO';
  const withCrc = `${simpleBase}6304ABCD`;
  const { qrString } = injectQrisNominal(withCrc, 100000);
  const rebuilt = simpleBase.replace('54041000', '5406100000');
  const expectedCrc = crc16CcittFalse(`${rebuilt}6304`)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
  assert.equal((qrString.match(/63/g) ?? []).length, 1, 'hanya satu tag 63');
  assert.ok(qrString.endsWith(`6304${expectedCrc}`));
});

test('injectQrisNominal: nominal tidak valid → ApiError 400', () => {
  assert.throws(
    () => injectQrisNominal(EMV_BASE, 'abc'),
    (err) => err instanceof ApiError && err.statusCode === 400,
  );
});

test('injectQrisNominal: parse error (length melebihi string) → ApiError 400', () => {
  assert.throws(
    () => injectQrisNominal('000201010211266399ABC', 10000),
    (err) => err instanceof ApiError && err.statusCode === 400,
  );
});

test('generateQrisQr: menghasilkan data URL PNG base64 512px', async () => {
  const dataUrl = await generateQrisQr(`${EMV_BASE}63047258`);
  assert.ok(dataUrl.startsWith('data:image/png;base64,'));
  const png = Buffer.from(dataUrl.split(',')[1], 'base64');
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'signature PNG');
  assert.ok(png.length > 500, 'PNG berisi data');
});

function makeQrisDb({ tagihan, config }) {
  return {
    tagihanCicilan: {
      findUnique: async () => tagihan ?? null,
    },
    sistemConfig: {
      findFirst: async () => config ?? null,
    },
  };
}

test('getQrisForTagihan: scopeJamaahId bukan pemilik tagihan → ApiError 403 FORBIDDEN', async () => {
  const db = makeQrisDb({
    tagihan: { id: 't1', jamaahId: 'j-pemilik', jumlah: 100000 },
    config: { qrisDanaString: EMV_BASE },
  });
  const service = createQrisService(db);
  await assert.rejects(
    () => service.getQrisForTagihan('t1', 'dana', 'j-penyusup'),
    (err) => err instanceof ApiError && err.statusCode === 403 && err.code === 'FORBIDDEN',
  );
});

test('getQrisForTagihan: scopeJamaahId pemilik tagihan → sukses menghasilkan QRIS', async () => {
  const db = makeQrisDb({
    tagihan: { id: 't1', jamaahId: 'j-pemilik', jumlah: 100000 },
    config: { qrisDanaString: EMV_BASE },
  });
  const service = createQrisService(db);
  const result = await service.getQrisForTagihan('t1', 'dana', 'j-pemilik');
  assert.ok(result.qrBase64.startsWith('data:image/png;base64,'));
  assert.equal(result.nominal, 100000);
  assert.equal(result.provider, 'DANA');
});

test('getQrisForTagihan: tanpa scopeJamaahId (admin/staff) → tetap bisa akses tagihan apa pun', async () => {
  const db = makeQrisDb({
    tagihan: { id: 't1', jamaahId: 'j-pemilik', jumlah: 100000 },
    config: { qrisDanaString: EMV_BASE },
  });
  const service = createQrisService(db);
  const result = await service.getQrisForTagihan('t1', 'dana');
  assert.ok(result.qrBase64.startsWith('data:image/png;base64,'));
});