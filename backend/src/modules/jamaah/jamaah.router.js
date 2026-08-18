import { Router } from 'express';
import { listJamaah, getJamaah, createJamaah, updateJamaah } from './jamaah.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createJamaahSchema, updateJamaahSchema } from './jamaah.schema.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Admin & staff (pendaftaran mandiri publik = Phase 5)
router.get('/', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'STAFF'), listJamaah);
router.get('/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'STAFF'), getJamaah);
router.post('/', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'STAFF'), validate(createJamaahSchema), createJamaah);
router.put('/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'STAFF'), validate(updateJamaahSchema), updateJamaah);

export default router;