import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../lib/api-error.js';

const ALLOWED_MIME = new Map([
  ['application/pdf', 'pdf'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storagePath = path.resolve(process.cwd(), env.storagePath);
fs.mkdirSync(storagePath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, storagePath),
  filename: (req, file, cb) => {
    // Pola nama: [jamaahId]-[tipe]-[timestamp].[ext]
    const idPart = req.body?.jamaahId ?? req.body?.tagihanId ?? 'unknown';
    const tipePart = String(req.body?.tipe ?? 'BUKTI').toUpperCase();
    const ext = ALLOWED_MIME.get(file.mimetype) ?? 'bin';
    cb(null, `${idPart}-${tipePart}-${Date.now()}.${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest('Tipe file harus PDF, JPG, PNG, atau WEBP', undefined, 'FILE_TYPE_NOT_ALLOWED'));
}

export const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE }, fileFilter });

// Helper: middleware untuk 1 file dengan nama field tertentu
export function uploadSingle(fieldName) {
  return upload.single(fieldName);
}