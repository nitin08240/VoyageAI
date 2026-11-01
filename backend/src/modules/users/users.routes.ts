import { Router } from 'express';
import * as usersController from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Public contact form submission
// POST /api/v1/users/contact
router.post('/contact', usersController.submitContact);

// GET /api/v1/users/profile
router.get('/profile', authenticate, usersController.getProfile);

// PATCH /api/v1/users/profile
router.patch('/profile', authenticate, usersController.updateProfile);

export default router;
