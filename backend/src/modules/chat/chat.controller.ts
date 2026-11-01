import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { chatService } from './chat.service';
import { sendSuccess } from '../../shared/response';

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const result = await chatService.sendMessage(userId, req.body);
    sendSuccess(res, result, 'Message processed successfully', 200);
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const history = await chatService.getHistory(userId);
    sendSuccess(res, history, 'Chat history retrieved', 200);
  } catch (error) {
    next(error);
  }
}

export async function getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { conversationId } = req.params;

    const conversation = await chatService.getConversation(userId, conversationId as string);
    sendSuccess(res, conversation, 'Conversation retrieved', 200);
  } catch (error) {
    next(error);
  }
}

export async function deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { conversationId } = req.params;

    const result = await chatService.deleteConversation(userId, conversationId as string);
    sendSuccess(res, result, 'Conversation deleted', 200);
  } catch (error) {
    next(error);
  }
}

export async function applySuggestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const result = await chatService.applyItinerarySuggestion(userId, req.body);
    sendSuccess(res, result, 'Itinerary updated', 200);
  } catch (error) {
    next(error);
  }
}

