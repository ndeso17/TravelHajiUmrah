import { Router } from 'express';
import { getLanding, createPublicJamaah, getMe, updateMe } from './publik.controller.js';
import { heroVideoToken, streamHeroVideo } from './hero-video.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { publicJamaahSchema, updateMeSchema } from './publik.schema.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Publik: landing CMS dalam satu call
router.get('/landing', getLanding);

// Publik: video hero (stream aman — token short-lived + gate origin)
router.get('/hero-video/token', heroVideoToken);
router.get('/hero-video', streamHeroVideo);

// Publik: pendaftaran mandiri tanpa auth
router.post('/jamaah', validate(publicJamaahSchema), createPublicJamaah);

router.get('/me', authenticate, requireRole('JAMAAH'), getMe);
router.put('/me', authenticate, requireRole('JAMAAH'), validate(updateMeSchema), updateMe);

export default router;