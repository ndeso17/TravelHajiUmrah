import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createUser, listUsers, updateUser } from './users.controller.js';
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from './users.schema.js';

const router = Router();

router.use(authenticate, requireRole('SUPER_ADMIN'));
router.get('/', validate(listUsersQuerySchema, 'query'), listUsers);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate(updateUserSchema), updateUser);

export default router;
