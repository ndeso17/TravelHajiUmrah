import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware.js';
import authRouter from './modules/auth/auth.router.js';
import paketRouter from './modules/paket/paket.router.js';
import jamaahRouter from './modules/jamaah/jamaah.router.js';
import tagihanRouter from './modules/tagihan/tagihan.router.js';
import pembayaranRouter from './modules/pembayaran/pembayaran.router.js';
import dokumenRouter from './modules/dokumen/dokumen.router.js';
import manifestRouter from './modules/manifest/manifest.router.js';
import notifikasiRouter from './modules/notifikasi/notifikasi.router.js';
import laporanRouter from './modules/laporan/laporan.router.js';
import settingsRouter from './modules/settings/settings.router.js';
import usersRouter from './modules/users/users.router.js';
import publikRouter from './modules/publik/publik.router.js';

const app = express();

app.use(cors({ origin: env.frontendOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRouter);
app.use('/api/paket', paketRouter);
app.use('/api/jamaah', jamaahRouter);
app.use('/api/tagihan', tagihanRouter);
app.use('/api/pembayaran', pembayaranRouter);
app.use('/api/dokumen', dokumenRouter);
app.use('/api/manifest', manifestRouter);
app.use('/api/notifikasi', notifikasiRouter);
app.use('/api/laporan', laporanRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/publik', publikRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
