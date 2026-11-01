import { Router } from 'express';
import * as aiController from './ai.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { aiLimiter } from '../../middleware/rateLimit.middleware';
import { generateItinerarySchema, regenerateItinerarySchema } from './ai.validation';

const router = Router();

router.use(authenticate);

router.post('/generate', aiLimiter, validate(generateItinerarySchema), aiController.generateItinerary);
router.get('/jobs/:jobId', aiController.getJobStatus);
router.post('/regenerate', aiLimiter, validate(regenerateItinerarySchema), aiController.regenerateItinerary);

export default router;
