import { Router } from 'express';
import multer from 'multer';

import { UserController as UserControllerClass } from '@controllers/UserController';
import { validate } from '@middlewares/validateMiddleware';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticationMiddleware';
import { userSchema } from '@schemas/userSchema';

const storage = multer.memoryStorage();

export const upload = multer({ storage });

const usersRoutes = Router();

export const UserController = new UserControllerClass();

usersRoutes.get('/profile', ensureAuthenticated, UserController.showProfile);

usersRoutes.put(
  '/profile',
  upload.single('avatar'),
  ensureAuthenticated,
  validate(userSchema.update),
  UserController.updateProfile.bind(UserController)
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
