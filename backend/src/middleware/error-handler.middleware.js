import { ApiError } from '../lib/api-error.js';
import multer from 'multer';

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound('Route tidak ditemukan'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
  }

  // Prisma known errors → 404/400 yang ramah
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Data tidak ditemukan' },
      });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'Data sudah ada (duplikat)' },
      });
    }
  }

  // JSON body malformed
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Body JSON tidak valid' },
    });
  }

  // Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'Ukuran file melebihi batas maksimum 10MB' },
      });
    }
    return res.status(400).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: `Upload gagal: ${err.message}` },
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[hajiumroh-api]', err);
  }

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan internal' },
  });
}