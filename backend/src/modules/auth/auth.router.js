import { Router } from 'express';
import { login, logout, refresh } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { loginSchema } from './auth.schema.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);

export default router;