import { Router } from 'express';
import multer from 'multer';

import { validate } from '@middlewares/validateMiddleware';
import { challengeSchema } from '@schemas/challengeSchema';
import { isAdmin } from '@middlewares/isAdminMiddleware';
import { userSchema } from '@schemas/userSchema';
import { ChallengeController } from './challenge.routes';
import { UserController } from './user.routes';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

const adminRoutes = Router();

// CHALLENGES ROUTES

adminRoutes.get(
  '/challenges',
  isAdmin,
  ChallengeController.adminIndex.bind(ChallengeController)
);

adminRoutes.get(
  '/challenges/:id',
  isAdmin,
  ChallengeController.adminShow.bind(ChallengeController)
);

adminRoutes.post(
  '/challenges',
  upload.single('image'),
  isAdmin,
  validate(challengeSchema.create),
  ChallengeController.create.bind(ChallengeController)
);

adminRoutes.put(
  '/challenges/:id',
  upload.single('image'),
  isAdmin,
  ChallengeController.update.bind(ChallengeController)
);

adminRoutes.delete(
  '/challenges/:id',
  isAdmin,
  ChallengeController.delete.bind(ChallengeController)
);

// USER ROUTES

adminRoutes.get('/users', isAdmin, UserController.index.bind(UserController));

adminRoutes.get(
  '/users/:id',
  isAdmin,
  UserController.show.bind(UserController)
);

adminRoutes.post(
  '/users',
  upload.single('avatar'),
  isAdmin,
  validate(userSchema.register),
  UserController.create.bind(UserController)
);

adminRoutes.put(
  '/users/:id',
  upload.single('avatar'),
  isAdmin,
  validate(userSchema.update),
  UserController.update.bind(UserController)
);

adminRoutes.delete(
  '/users/:id',
  isAdmin,
  UserController.delete.bind(UserController)
);

adminRoutes.post(
  '/users/:id/password-reset',
  isAdmin,
  UserController.passwordReset.bind(UserController)
);

export { adminRoutes };
