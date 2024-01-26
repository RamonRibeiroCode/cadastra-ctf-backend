import { Router } from 'express';

import { usersRoutes } from './user.routes';
import { authRoutes } from './auth.routes';
import { challengeRoutes } from './challenge.routes';
import { adminRoutes } from './admin.routes';

const router = Router();

router.use('/api/users', usersRoutes);
router.use('/api/challenges', challengeRoutes);
router.use('/api/sessions', authRoutes);
router.use('/api/admin', adminRoutes);

export { router };
