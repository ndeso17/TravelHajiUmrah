import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { getQris, updateQris } from './settings.controller.js';
import { updateQrisSchema } from './settings.schema.js';

const router = Router();

router.get('/qris', authenticate, requireRole('SUPER_ADMIN'), getQris);
router.put('/qris', authenticate, requireRole('SUPER_ADMIN'), validate(updateQrisSchema), updateQris);

export default router;