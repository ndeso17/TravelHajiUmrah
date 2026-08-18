import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { signHeroVideoToken, verifyHeroVideoToken, isAllowedOrigin } from './hero-video.controller.js';

test('sign/verify token: round-trip valid', () => {
  const token = signHeroVideoToken('secret', 60_000);
  const result = verifyHeroVideoToken('secret', token);
  assert.equal(result.ok, true);
  assert.ok(result.exp > Date.now());
});

test('verify token: kedaluwarsa → EXPIRED', async () => {
  const token = signHeroVideoToken('secret', 1);
  await new Promise((resolve) => setTimeout(resolve, 10));
  const result = verifyHeroVideoToken('secret', token);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'EXPIRED');
});

test('verify token: tanda tangan diubah → INVALID', () => {
  const token = signHeroVideoToken('secret', 60_000);
  const [payload, signature] = token.split('.');
  const tampered = (signature[0] === 'A' ? 'B' : 'A') + signature.slice(1);
  const result = verifyHeroVideoToken('secret', `${payload}.${tampered}`);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'INVALID');
});

test('verify token: secret berbeda → INVALID', () => {
  const token = signHeroVideoToken('secret-a', 60_000);
  assert.equal(verifyHeroVideoToken('secret-b', token).ok, false);
});

test('verify token: input sampah → INVALID', () => {
  assert.equal(verifyHeroVideoToken('secret', 'bukan-token').ok, false);
  assert.equal(verifyHeroVideoToken('secret', undefined).ok, false);
  assert.equal(verifyHeroVideoToken('secret', 'a.b.c').ok, false);
  assert.equal(verifyHeroVideoToken('secret', 123).ok, false);
});

test('isAllowedOrigin: menerima origin frontend', () => {
  assert.equal(isAllowedOrigin('http://localhost:5173/', 'http://localhost:5173'), true);
  assert.equal(isAllowedOrigin('http://localhost:5173', 'http://localhost:5173/'), true);
  assert.equal(isAllowedOrigin('http://localhost:5173/paket/1', 'http://localhost:5173'), true);
});

test('isAllowedOrigin: menolak tanpa header / origin lain / malformed', () => {
  assert.equal(isAllowedOrigin(undefined, 'http://localhost:5173'), false);
  assert.equal(isAllowedOrigin('', 'http://localhost:5173'), false);
  assert.equal(isAllowedOrigin('http://evil.com/', 'http://localhost:5173'), false);
  assert.equal(isAllowedOrigin('http://localhost:5174/', 'http://localhost:5173'), false);
  assert.equal(isAllowedOrigin('null', 'http://localhost:5173'), false);
  assert.equal(isAllowedOrigin('bukan url', 'http://localhost:5173'), false);
});

let server;
let baseUrl;
let tmpVideoPath;

test.before(async () => {
  tmpVideoPath = path.join(os.tmpdir(), `hero-test-${process.pid}-${Date.now()}.mp4`);
  fs.writeFileSync(tmpVideoPath, Buffer.alloc(256, 0x61));
  process.env.HERO_VIDEO_PATH = tmpVideoPath;

  const { default: app } = await import('../../app.js');
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server?.close();
  if (tmpVideoPath) fs.rmSync(tmpVideoPath, { force: true });
  delete process.env.HERO_VIDEO_PATH;
});

const REFERER = { Referer: 'http://localhost:5173/' };
const EVIL_REFERER = { Referer: 'http://evil.com/' };

async function getValidToken() {
  const res = await fetch(`${baseUrl}/api/publik/hero-video/token`, { headers: REFERER });
  const body = await res.json();
  return body.data.token;
}

test('integrasi: token endpoint menolak tanpa referer', async () => {
  const res = await fetch(`${baseUrl}/api/publik/hero-video/token`);
  assert.equal(res.status, 403);
});

test('integrasi: token endpoint menolak referer asing', async () => {
  const res = await fetch(`${baseUrl}/api/publik/hero-video/token`, { headers: EVIL_REFERER });
  assert.equal(res.status, 403);
});

test('integrasi: token endpoint mengeluarkan token', async () => {
  const res = await fetch(`${baseUrl}/api/publik/hero-video/token`, { headers: REFERER });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(typeof body.data.token, 'string');
});

test('integrasi: stream tanpa token ditolak', async () => {
  const res = await fetch(`${baseUrl}/api/publik/hero-video`, { headers: REFERER });
  assert.equal(res.status, 403);
});

test('integrasi: stream dengan token valid → 200 video/mp4 inline', async () => {
  const token = await getValidToken();
  const res = await fetch(`${baseUrl}/api/publik/hero-video?token=${encodeURIComponent(token)}`, { headers: REFERER });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') ?? '', /^video\/mp4/);
  assert.match(res.headers.get('content-disposition') ?? '', /inline/);
  assert.equal(Number(res.headers.get('content-length')), 256);
  const bytes = await res.arrayBuffer();
  assert.equal(bytes.byteLength, 256);
});

test('integrasi: stream mendukung Range → 206', async () => {
  const token = await getValidToken();
  const res = await fetch(`${baseUrl}/api/publik/hero-video?token=${encodeURIComponent(token)}`, {
    headers: { ...REFERER, Range: 'bytes=0-99' },
  });
  assert.equal(res.status, 206);
  assert.match(res.headers.get('content-range') ?? '', /^bytes 0-99\/256$/);
});

test('integrasi: stream dengan token rusak → 403', async () => {
  const res = await fetch(`${baseUrl}/api/publik/hero-video?token=tampered.invalid`, { headers: REFERER });
  assert.equal(res.status, 403);
});

test('integrasi: stream tanpa referer tapi token valid → 403', async () => {
  const token = await getValidToken();
  const res = await fetch(`${baseUrl}/api/publik/hero-video?token=${encodeURIComponent(token)}`);
  assert.equal(res.status, 403);
});
