import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtAccessSecret, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, jti: randomUUID() },
    env.jwtRefreshSecret,
    { expiresIn: REFRESH_TTL },
  );
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}