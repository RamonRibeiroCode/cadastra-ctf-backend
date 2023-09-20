import { Router } from 'express';
import multer from 'multer';

import { UserController as UserControllerClass } from '@controllers/UserController';
import { storageConfig } from '@config/storage';
import { validate } from '@middlewares/validateMiddleware';
import { userSchema } from '@schemas/userSchema';

const usersRoutes = Router();
const upload = multer(storageConfig.options.multer);

const UserController = new UserControllerClass();

usersRoutes.get('/', UserController.index);
usersRoutes.post(
  '/register',
  upload.single('avatar'),
  validate(userSchema.register),
  UserController.register.bind(UserController)
);

export { usersRoutes };
