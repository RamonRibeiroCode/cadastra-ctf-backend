import { Router } from 'express';
import multer from 'multer';

import { UserController as UserControllerClass } from '@controllers/UserController';
import { storageConfig } from '@config/storage';

const usersRoutes = Router();
const upload = multer(storageConfig.options.multer);

const UserController = new UserControllerClass();

usersRoutes.get('/', UserController.index);
usersRoutes.post(
  '/register',
  upload.single('avatar'),
  UserController.register.bind(UserController)
);

export { usersRoutes };
