import { Router } from 'express';
import multer from 'multer';

import { ChallengeController as ChallengeControllerClass } from '@controllers/ChallengeController';
import { validate } from '@middlewares/validateMiddleware';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticationMiddleware';
import { challengeSchema } from '@schemas/challengeSchema';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

const challengeRoutes = Router();

const ChallengeController = new ChallengeControllerClass();

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

challengeRoutes.delete(
  '/:id',
  ensureAuthenticated,
  ChallengeController.delete.bind(ChallengeController)
);

challengeRoutes.post(
  '/',
  upload.single('image'),
  validate(challengeSchema.create),
  ensureAuthenticated,
  ChallengeController.create.bind(ChallengeController)
);

challengeRoutes.post(
  '/:id/submit-flag',
  ensureAuthenticated,
  ChallengeController.submitFlag.bind(ChallengeController)
);

export { challengeRoutes };
