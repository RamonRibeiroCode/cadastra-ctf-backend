import { Router } from 'express';
import multer from 'multer';

import { ChallengeController as ChallengeControllerClass } from '@controllers/ChallengeController';
import { storageConfig } from '@config/storage';
import { validate } from '@middlewares/validateMiddleware';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticationMiddleware';
import { challengeSchema } from '@schemas/challengeSchema';

const challengeRoutes = Router();
const upload = multer(storageConfig.options.multer);

const ChallengeController = new ChallengeControllerClass();

challengeRoutes.post(
  '/',
  upload.single('image'),
  validate(challengeSchema.create),
  ensureAuthenticated,
  ChallengeController.create.bind(ChallengeController)
);

export { challengeRoutes };
