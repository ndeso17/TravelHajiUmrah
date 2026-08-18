import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { pendapatan, keberangkatan } from './laporan.controller.js';

const router = Router();

router.get('/pendapatan', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), pendapatan);
router.get('/keberangkatan', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), keberangkatan);

export default router;