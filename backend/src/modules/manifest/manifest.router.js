import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { listManifest, exportManifest } from './manifest.controller.js';
import { listManifestQuerySchema, exportManifestQuerySchema } from './manifest.schema.js';

const router = Router();

router.get('/', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'STAFF'), validate(listManifestQuerySchema, 'query'), listManifest);
router.get('/export', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'STAFF'), validate(exportManifestQuerySchema, 'query'), exportManifest);

export default router;