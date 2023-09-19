import { Router } from 'express';

import { usersRoutes } from './user.routes';

const router = Router();

router.use('/api/users', usersRoutes);

export { router };
