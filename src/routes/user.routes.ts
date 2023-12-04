import { Router } from 'express';

import { UserController as UserControllerClass } from '@controllers/UserController';
import { validate } from '@middlewares/validateMiddleware';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticationMiddleware';
import { userSchema } from '@schemas/userSchema';
import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({ storage });

const usersRoutes = Router();

const UserController = new UserControllerClass();

usersRoutes.get('/profile', ensureAuthenticated, UserController.showProfile);
usersRoutes.post(
  '/register',
  upload.single('avatar'),
  validate(userSchema.register),
  UserController.register.bind(UserController)
);
usersRoutes.put(
  '/profile',
  upload.single('avatar'),
  validate(userSchema.update),
  ensureAuthenticated,
  UserController.update.bind(UserController)
);

usersRoutes.get(
  '/scoreboard',
  ensureAuthenticated,
  UserController.scoreboard.bind(UserController)
);

usersRoutes.get(
  '/max-points',
  ensureAuthenticated,
  UserController.maxPoints.bind(UserController)
);

usersRoutes.get(
  '/activities',
  ensureAuthenticated,
  UserController.activities.bind(UserController)
);

export { usersRoutes };
