import { authService } from './auth.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: REFRESH_MAX_AGE,
  });
}

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, data: { user, accessToken } });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: 'lax' });
  res.json({ success: true, data: { message: 'Logout berhasil' } });
});

export const refresh = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.refresh(req.cookies?.[REFRESH_COOKIE]);
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, data: { user, accessToken } });
});