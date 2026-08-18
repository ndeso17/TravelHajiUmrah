import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { broadcast } from './notifikasi.controller.js';
import { broadcastSchema } from './notifikasi.schema.js';

const router = Router();

router.post(
  '/broadcast',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate(broadcastSchema),
  broadcast,
);

export default router;