import { Router } from 'express';
import { generateTagihan, listTagihan } from './tagihan.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { generateTagihanSchema } from './tagihan.schema.js';
import { authenticate, requireRole, requireJamaahScope } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/generate', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'STAFF'), validate(generateTagihanSchema), generateTagihan);
router.get('/:jamaahId', authenticate, requireJamaahScope, listTagihan);

export default router;