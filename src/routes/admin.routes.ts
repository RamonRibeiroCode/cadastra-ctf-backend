import { Router } from 'express';
import multer from 'multer';

import { validate } from '@middlewares/validateMiddleware';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticationMiddleware';
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
  ensureAuthenticated,
  isAdmin,
  ChallengeController.adminIndex.bind(ChallengeController)
);

adminRoutes.post(
  '/challenges',
  upload.single('image'),
  ensureAuthenticated,
  isAdmin,
  validate(challengeSchema.create),
  ChallengeController.create.bind(ChallengeController)
);

adminRoutes.delete(
  '/challenges/:id',
  ensureAuthenticated,
  isAdmin,
  ChallengeController.delete.bind(ChallengeController)
);

// USER ROUTES

adminRoutes.get(
  '/users',
  ensureAuthenticated,
  isAdmin,
  UserController.index.bind(UserController)
);

adminRoutes.get(
  '/users/:id',
  ensureAuthenticated,
  isAdmin,
  UserController.show.bind(UserController)
);

adminRoutes.post(
  '/users',
  upload.single('avatar'),
  ensureAuthenticated,
  isAdmin,
  validate(userSchema.register),
  UserController.create.bind(UserController)
);

adminRoutes.put(
  '/users/:id',
  upload.single('avatar'),
  ensureAuthenticated,
  isAdmin,
  validate(userSchema.update),
  UserController.update.bind(UserController)
);

adminRoutes.delete(
  '/users/:id',
  ensureAuthenticated,
  isAdmin,
  UserController.delete.bind(UserController)
);

export { adminRoutes };
