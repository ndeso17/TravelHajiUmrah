import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

import { createAuthService } from './auth.service.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/token.js';
import { ApiError } from '../../lib/api-error.js';

const PASSWORD = 'rahasia123';

async function makeFakeDb() {
  const password = await bcrypt.hash(PASSWORD, 4);
  const user = {
    id: 'user-1',
    email: 'admin@hajiumroh.test',
    name: 'Admin Test',
    role: 'SUPER_ADMIN',
    isActive: true,
    password,
  };
  return {
    user: {
      findUnique: async ({ where }) => {
        if (where.email === user.email || where.id === user.id) return user;
        return null;
      },
    },
  };
}

test('login sukses: mengembalikan user aman + accessToken + refreshToken', async () => {
  const service = createAuthService(await makeFakeDb());
  const result = await service.login({ email: 'admin@hajiumroh.test', password: PASSWORD });

  assert.equal(result.user.email, 'admin@hajiumroh.test');
  assert.equal(result.user.role, 'SUPER_ADMIN');
  assert.equal(result.user.password, undefined, 'password tidak boleh bocor');
  assert.ok(result.accessToken.length > 10);
  assert.ok(result.refreshToken.length > 10);
});

test('login gagal: password salah → ApiError 401 UNAUTHORIZED', async () => {
  const service = createAuthService(await makeFakeDb());
  await assert.rejects(
    () => service.login({ email: 'admin@hajiumroh.test', password: 'password-salah' }),
    (err) => err instanceof ApiError && err.statusCode === 401 && err.code === 'UNAUTHORIZED',
  );
});

test('login gagal: email tidak dikenal → ApiError 401 UNAUTHORIZED', async () => {
  const service = createAuthService(await makeFakeDb());
  await assert.rejects(
    () => service.login({ email: 'tidak-ada@hajiumroh.test', password: PASSWORD }),
    (err) => err instanceof ApiError && err.statusCode === 401,
  );
});

test('refresh: token valid → access baru + refresh baru (rotasi)', async () => {
  const service = createAuthService(await makeFakeDb());
  const { refreshToken } = await service.login({ email: 'admin@hajiumroh.test', password: PASSWORD });

  const result = await service.refresh(refreshToken);
  assert.equal(result.user.id, 'user-1');
  assert.ok(result.accessToken.length > 10);
  assert.ok(result.refreshToken.length > 10);
  assert.notEqual(result.refreshToken, refreshToken, 'refresh token harus dirotasi');
});

test('refresh: token invalid → ApiError 401', async () => {
  const service = createAuthService(await makeFakeDb());
  await assert.rejects(
    () => service.refresh('token-palsu'),
    (err) => err instanceof ApiError && err.statusCode === 401,
  );
});

test('refresh: tanpa token → ApiError 401', async () => {
  const service = createAuthService(await makeFakeDb());
  await assert.rejects(
    () => service.refresh(undefined),
    (err) => err instanceof ApiError && err.statusCode === 401,
  );
});

test('token: roundtrip signRefreshToken → verifyRefreshToken mengembalikan sub', () => {
  const token = signRefreshToken({ id: 'user-1', role: 'ADMIN' });
  const payload = verifyRefreshToken(token);
  assert.equal(payload.sub, 'user-1');
  assert.equal(payload.role, 'ADMIN');
});

test('token: access token tidak bisa diverifikasi dengan secret refresh', () => {
  const access = signAccessToken({ id: 'user-1', role: 'ADMIN' });
  assert.throws(() => verifyRefreshToken(access), /invalid signature/);
});