import { Router } from 'express';
import * as aiController from './ai.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { aiLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

router.use(authenticate);

router.post('/generate', aiLimiter, aiController.generateItinerary);
router.get('/jobs/:jobId', aiController.getJobStatus);
router.post('/regenerate', aiLimiter, aiController.regenerateItinerary);

export default router;
