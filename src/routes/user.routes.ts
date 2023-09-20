import { Router } from 'express';

import { UserController as UserControllerClass } from '@controllers/UserController';

const usersRoutes = Router();

const UserController = new UserControllerClass();

usersRoutes.get('/', UserController.index);
usersRoutes.post('/register', UserController.register.bind(UserController));

export { usersRoutes };
