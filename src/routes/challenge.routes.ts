import { Router } from 'express';
import multer from 'multer';

import { ChallengeController as ChallengeControllerClass } from '@controllers/ChallengeController';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticationMiddleware';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

const challengeRoutes = Router();

export const ChallengeController = new ChallengeControllerClass();

challengeRoutes.get(
  '/',
  ensureAuthenticated,
  ChallengeController.index.bind(ChallengeController)
);

challengeRoutes.get(
  '/:id',
  ensureAuthenticated,
  ChallengeController.show.bind(ChallengeController)
);

challengeRoutes.post(
  '/:id/submit-flag',
  ensureAuthenticated,
  ChallengeController.submitFlag.bind(ChallengeController)
);

export { challengeRoutes };
