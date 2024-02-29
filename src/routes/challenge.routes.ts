import { Router } from 'express';

import { ChallengeController as ChallengeControllerClass } from '@controllers/ChallengeController';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticationMiddleware';

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
