import { Router } from 'express';
import {
  listPembayaran,
  createPembayaran,
  uploadBukti,
  verifikasiPembayaran,
  cashPembayaran,
  getQris,
  getInvoice,
} from './pembayaran.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createPembayaranSchema,
  uploadBuktiSchema,
  verifikasiPembayaranSchema,
  cashPembayaranSchema,
} from './pembayaran.schema.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';
import { authenticate, requireRole, requireJamaahScope } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, requireJamaahScope, listPembayaran);
router.post('/', authenticate, requireJamaahScope, validate(createPembayaranSchema), createPembayaran);
router.post('/upload-bukti', authenticate, requireJamaahScope, uploadSingle('buktiBayarFile'), validate(uploadBuktiSchema), uploadBukti);
router.post('/verifikasi/:pembayaranId', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), validate(verifikasiPembayaranSchema), verifikasiPembayaran);
router.post('/cash', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'STAFF'), validate(cashPembayaranSchema), cashPembayaran);
router.get('/qris/:tagihanId', authenticate, requireJamaahScope, getQris);
router.get('/:id/invoice', authenticate, requireJamaahScope, getInvoice);

export default router;