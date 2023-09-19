import { Router } from 'express';

import { UserController as UserControllerClass } from '@controllers/UserController';

const usersRoutes = Router();

const UserController = new UserControllerClass();

usersRoutes.get('/', UserController.index);

export { usersRoutes };
