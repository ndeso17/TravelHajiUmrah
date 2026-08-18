import jwt from 'jsonwebtoken';
import { ApiError } from '../lib/api-error.js';
import { env } from '../config/env.js';
import prisma from '../lib/prisma.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw ApiError.unauthorized('Token tidak ditemukan');

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized('Token tidak valid atau kedaluwarsa'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Belum terautentikasi'));
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Akses ditolak'));
    next();
  };
}

// Owner-check: role JAMAAH hanya boleh mengakses data jamaah miliknya sendiri (via req.scopeJamaahId).
export function createRequireJamaahScope(db = prisma) {
  return async function requireJamaahScope(req, res, next) {
    if (!req.user) return next(ApiError.unauthorized('Belum terautentikasi'));
    if (req.user.role !== 'JAMAAH') return next();

    try {
      const jamaah = await db.jamaah.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });
      if (!jamaah) {
        return next(ApiError.forbidden('Akun jamaah tidak terhubung ke data jamaah'));
      }
      req.scopeJamaahId = jamaah.id;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export const requireJamaahScope = createRequireJamaahScope();