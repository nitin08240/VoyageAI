import { Router } from 'express';
import * as tripsController from './trips.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTripSchema, updateTripSchema } from './trips.validation';

const router = Router();

// All trip routes require authentication except shared endpoint (handled in app.ts or separately)
router.use(authenticate);

router.post('/', validate(createTripSchema), tripsController.createTrip);
router.get('/', tripsController.getTrips);
router.get('/:id', tripsController.getTripById);
router.patch('/:id', validate(updateTripSchema), tripsController.updateTrip);
router.delete('/:id', tripsController.deleteTrip);
router.post('/:id/duplicate', tripsController.duplicateTrip);
router.post('/:id/share', tripsController.shareTrip);
router.delete('/:id/share', tripsController.unshareTrip);

export default router;
