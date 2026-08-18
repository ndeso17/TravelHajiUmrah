import { Router } from 'express';
import { listPaket, getPaket, createPaket, updatePaket, deletePaket } from './paket.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createPaketSchema, updatePaketSchema } from './paket.schema.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Publik (katalog B2C)
router.get('/', listPaket);
router.get('/:id', getPaket);

// Admin only
router.post('/', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), validate(createPaketSchema), createPaket);
router.put('/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), validate(updatePaketSchema), updatePaket);
router.delete('/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), deletePaket);

export default router;