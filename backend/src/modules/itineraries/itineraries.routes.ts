import { Router } from 'express';
import * as itinerariesController from './itineraries.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/:tripId', itinerariesController.getItinerary);
router.post('/:tripId/geocode', itinerariesController.geocodeItinerary);
router.patch('/:id', itinerariesController.updateItinerary);
router.post('/:id/export', itinerariesController.exportItinerary);

export default router;
