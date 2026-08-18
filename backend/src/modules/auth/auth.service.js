import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/token.js';

export function createAuthService(db = prisma) {
  function toSafeUser(user) {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async function login({ email, password }) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw ApiError.unauthorized('Email atau password salah');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw ApiError.unauthorized('Email atau password salah');

    return {
      user: toSafeUser(user),
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    };
  }

  async function refresh(refreshToken) {
    if (!refreshToken) throw ApiError.unauthorized('Refresh token tidak ditemukan');

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Refresh token tidak valid atau kedaluwarsa');
    }

    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw ApiError.unauthorized('Akun tidak ditemukan atau nonaktif');

    return {
      user: toSafeUser(user),
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    };
  }

  return { login, refresh };
}

export const authService = createAuthService();