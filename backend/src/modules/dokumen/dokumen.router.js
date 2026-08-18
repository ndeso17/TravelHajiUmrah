import { Router } from 'express';
import { authenticate, requireRole, requireJamaahScope } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';
import { listDokumen, uploadDokumen, verifikasiDokumen } from './dokumen.controller.js';
import { uploadDokumenSchema, verifikasiDokumenSchema, listDokumenQuerySchema } from './dokumen.schema.js';

const router = Router();

router.get('/', authenticate, requireJamaahScope, validate(listDokumenQuerySchema, 'query'), listDokumen);
router.post('/upload', authenticate, requireJamaahScope, uploadSingle('fileDokumen'), validate(uploadDokumenSchema), uploadDokumen);
router.post(
  '/verifikasi/:dokumenId',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'STAFF'),
  validate(verifikasiDokumenSchema),
  verifikasiDokumen,
);

export default router;