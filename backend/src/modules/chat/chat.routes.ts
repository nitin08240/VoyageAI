import { Router } from 'express';
import * as chatController from './chat.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { chatLimiter } from '../../middleware/rateLimit.middleware';
import { sendMessageSchema, applySuggestionSchema } from './chat.validation';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

router.post('/message', chatLimiter, validate(sendMessageSchema), chatController.sendMessage);
router.get('/history', chatController.getHistory);
router.get('/:conversationId', chatController.getConversation);
router.delete('/:conversationId', chatController.deleteConversation);
router.post('/apply-suggestion', validate(applySuggestionSchema), chatController.applySuggestion);

export default router;

