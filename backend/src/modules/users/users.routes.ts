import { Router } from 'express';
import * as usersController from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/users/profile
router.get('/profile', authenticate, usersController.getProfile);

// PATCH /api/v1/users/profile
router.patch('/profile', authenticate, usersController.updateProfile);

export default router;
