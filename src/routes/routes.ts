import { Router } from 'express';

import { usersRoutes } from './user.routes';
import { authRoutes } from './auth.routes';

const router = Router();

router.use('/api/users', usersRoutes);
router.use('/api', authRoutes);

export { router };
