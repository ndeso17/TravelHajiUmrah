import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { env } from '../../config/env.js';

const VIDEO_TTL_MS = 15 * 60 * 1000; // 15 menit

function getSecret() {
  return process.env.HERO_VIDEO_SECRET ?? env.heroVideoSecret ?? env.jwtAccessSecret;
}

/**
 * Tanda tangan HMAC-SHA256 untuk URL video hero (short-lived).
 * Format: base64url(JSON { exp }) + '.' + base64url(hmac).
 */
export function signHeroVideoToken(secret, ttlMs = VIDEO_TTL_MS) {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + ttlMs })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verifikasi token dengan perbandingan timing-safe.
 * Mengembalikan { ok: true, exp } atau { ok: false, reason: 'INVALID' | 'EXPIRED' }.
 */
export function verifyHeroVideoToken(secret, token) {
  if (typeof token !== 'string') return { ok: false, reason: 'INVALID' };

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return { ok: false, reason: 'INVALID' };

  const expected = crypto.createHmac('sha256', secret).update(payload).digest();
  const provided = Buffer.from(signature, 'base64url');
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return { ok: false, reason: 'INVALID' };
  }

  let exp;
  try {
    exp = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).exp;
  } catch {
    return { ok: false, reason: 'INVALID' };
  }

  if (typeof exp !== 'number' || exp <= Date.now()) return { ok: false, reason: 'EXPIRED' };

  return { ok: true, exp };
}

/**
 * Gate origin: request hanya diizinkan bila header Referer ATAU Origin
 * berasal dari origin frontend (FRONTEND_ORIGIN). Tanpa kedua header
 * (curl langsung, hotlink, dsb) → ditolak.
 */
export function isAllowedOrigin(headerValue, allowedOrigin) {
  if (!headerValue) return false;

  const normalize = (value) => value.replace(/\/+$/, '');
  const allowed = normalize(allowedOrigin);

  try {
    if (/^https?:\/\//i.test(headerValue)) {
      return normalize(new URL(headerValue).origin) === allowed;
    }
    return normalize(headerValue) === allowed;
  } catch {
    return false;
  }
}

function originAllowed(req) {
  const referer = req.get('referer');
  const origin = req.get('origin');
  return env.frontendOrigins.some(
    (allowed) => isAllowedOrigin(referer, allowed) || isAllowedOrigin(origin, allowed),
  );
}

function forbidden(res) {
  return res.status(403).json({
    success: false,
    error: { code: 'FORBIDDEN', message: 'Akses ditolak' },
  });
}

// Lokasi file di-resolve per request agar mudah di-override (test/dev).
function resolveVideoPath() {
  const videoPath = process.env.HERO_VIDEO_PATH ?? env.heroVideoPath;
  return path.resolve(process.cwd(), videoPath);
}

export const heroVideoToken = (req, res) => {
  if (!originAllowed(req)) return forbidden(res);
  return res.json({ success: true, data: { token: signHeroVideoToken(getSecret()) } });
};

export const streamHeroVideo = (req, res) => {
  if (!originAllowed(req)) return forbidden(res);

  const verification = verifyHeroVideoToken(getSecret(), req.query.token);
  if (!verification.ok) return forbidden(res);

  const absPath = resolveVideoPath();
  if (!fs.existsSync(absPath)) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Video tidak ditemukan' },
    });
  }

  return res.sendFile(absPath, {
    acceptRanges: true, // dukungan Range → 206 + seeking lancar
    headers: {
      'Content-Disposition': 'inline; filename="Hero.mp4"', // tidak pernah force-download
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=300', // private: tidak di-cache proxy/CDP publik
    },
  });
};
