import { Router } from 'express';
import * as itinerariesController from './itineraries.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateItinerarySchema } from './itineraries.validation';

const router = Router();

router.use(authenticate);

router.get('/:tripId', itinerariesController.getItinerary);
router.post('/:tripId/geocode', itinerariesController.geocodeItinerary);
router.post('/:tripId/enrich-media', itinerariesController.enrichItineraryMedia);
router.patch('/:id', validate(updateItinerarySchema), itinerariesController.updateItinerary);
router.post('/:id/export', itinerariesController.exportItinerary);

export default router;
