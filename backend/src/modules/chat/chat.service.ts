import { Types } from 'mongoose';
import { Conversation, IConversationDocument, IStructuredCard } from '../../models/Conversation.model';
import { Trip } from '../../models/Trip.model';
import { Itinerary } from '../../models/Itinerary.model';
import { NotFoundError, ForbiddenError, AppError } from '../../shared/errors';
import { aiProviderRouter } from '../../services/ai/ai.provider.router';
import { IChatMessage } from '../../services/ai/ai.provider.interface';
import { CHAT_TOOLS_DEFINITIONS, executeChatTool } from './chat.tools';
import { buildChatSystemPrompt, TripChatContext } from './chat.prompt';
import { SendMessageInput, ApplySuggestionInput } from './chat.validation';
import { env } from '../../config/env';

const MAX_TOOL_ITERATIONS = 3;

export class ChatService {
  /**
   * Process a user message, run tool calling if needed, and save persistent conversation.
   */
  public async sendMessage(userId: string, input: SendMessageInput) {
    const { conversationId, tripId, message } = input;

    let conversation: IConversationDocument | null = null;
    let resolvedTripId: Types.ObjectId | null = null;

    // 1. Resolve or Create Conversation
    if (conversationId && Types.ObjectId.isValid(conversationId)) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        throw new NotFoundError('Conversation not found or access denied.');
      }
      if (conversation.tripId) {
        resolvedTripId = conversation.tripId;
      }
    }

    if (tripId && Types.ObjectId.isValid(tripId)) {
      resolvedTripId = new Types.ObjectId(tripId);
      // Verify trip ownership
      const tripExists = await Trip.findOne({ _id: resolvedTripId, userId });
      if (!tripExists) {
        throw new ForbiddenError('You do not have access to this trip.');
      }

      if (!conversation) {
        // Reuse recent conversation for this trip if available
        conversation = await Conversation.findOne({ userId, tripId: resolvedTripId }).sort({ updatedAt: -1 });
      }
    }

    if (!conversation) {
      const generatedTitle = message.slice(0, 40).trim() + (message.length > 40 ? '...' : '');
      conversation = await Conversation.create({
        userId,
        tripId: resolvedTripId || null,
        title: generatedTitle || 'Travel Chat',
        messages: [],
      });
    }

    // 2. Build Trip Context if attached to a trip
    let tripContext: TripChatContext | null = null;
    if (conversation.tripId) {
      const trip = await Trip.findOne({ _id: conversation.tripId, userId });
      if (trip) {
        const itinerary = await Itinerary.findOne({ tripId: trip._id, userId }).sort({ version: -1 });

        tripContext = {
          destination: trip.destination.name,
          country: trip.destination.country,
          duration: trip.duration,
          dates: {
            start: trip.dates.start.toISOString().split('T')[0],
            end: trip.dates.end.toISOString().split('T')[0],
          },
          budget: trip.budget,
          travellers: trip.travellers,
          preferences: trip.preferences,
          itinerarySummary: itinerary?.days.map((d) => ({
            dayNumber: d.dayNumber,
            title: d.title,
            activities: [
              ...d.morning.map((m) => m.name),
              ...d.afternoon.map((a) => a.name),
              ...d.evening.map((e) => e.name),
            ],
          })),
        };
      }
    }

    // 3. Prepare System Prompt & Bounded History
    const systemPrompt = buildChatSystemPrompt(tripContext);
    const maxHistory = env.CHAT_MAX_HISTORY_MESSAGES || 20;

    // Take last (maxHistory - 1) messages
    const recentDbMessages = conversation.messages.slice(-maxHistory);

    const chatMessages: IChatMessage[] = recentDbMessages.map((m) => ({
      role: m.role,
      content: m.content,
      toolCalls: m.toolCalls
        ? m.toolCalls.map((tc) => ({
            id: tc.id || `call_${tc.name}`,
            name: tc.name,
            args: tc.args || {},
          }))
        : undefined,
    }));

    // Append new user message
    chatMessages.push({
      role: 'user',
      content: message,
    });

    // 4. Autonomous Tool-Calling Execution Loop
    let iterations = 0;
    let finalAssistantReply = '';
    let finalProvider = 'gemini';
    let finalModel = 'gemini-3.7-flash';
    const accumulatedStructuredCards: IStructuredCard[] = [];
    const accumulatedToolCalls: any[] = [];
    const accumulatedToolResults: any[] = [];

    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const aiResponse = await aiProviderRouter.generateChatResponse(
        chatMessages,
        CHAT_TOOLS_DEFINITIONS,
        systemPrompt
      );

      finalProvider = aiResponse.provider;
      finalModel = aiResponse.model;

      // If the model wants to call tools
      if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
        // Record assistant's intent to call tools in history
        chatMessages.push({
          role: 'assistant',
          content: aiResponse.content || '',
          toolCalls: aiResponse.toolCalls,
          rawParts: aiResponse.rawParts,
        });

        for (const tc of aiResponse.toolCalls) {
          accumulatedToolCalls.push(tc);

          // Execute tool on backend
          const execution = await executeChatTool(tc.name, tc.args, {
            userId,
            tripId: conversation.tripId ? conversation.tripId.toString() : undefined,
          });

          accumulatedToolResults.push({
            toolName: tc.name,
            result: execution.result,
          });

          if (execution.structuredCards && execution.structuredCards.length > 0) {
            accumulatedStructuredCards.push(...execution.structuredCards);
          }

          // Feed result back into chat history for next turn
          chatMessages.push({
            role: 'tool',
            name: tc.name,
            toolCallId: tc.id,
            content: JSON.stringify(execution.result),
          });
        }
      } else {
        // No more tool calls; assistant delivered final answer
        finalAssistantReply = aiResponse.content;
        break;
      }
    }

    if (!finalAssistantReply) {
      // In case loop finished after tool execution without text, re-query once for final summary
      const finalSummary = await aiProviderRouter.generateChatResponse(
        chatMessages,
        undefined, // no tools on final wrap-up
        systemPrompt
      );
      finalAssistantReply = finalSummary.content;
      finalProvider = finalSummary.provider;
      finalModel = finalSummary.model;
    }

    // 5. Persist to MongoDB
    conversation.messages.push({
      role: 'user',
      content: message,
      createdAt: new Date(),
    });

    conversation.messages.push({
      role: 'assistant',
      content: finalAssistantReply,
      createdAt: new Date(),
      provider: finalProvider as any,
      model: finalModel,
      toolCalls: accumulatedToolCalls.length > 0 ? accumulatedToolCalls : undefined,
      toolResults: accumulatedToolResults.length > 0 ? accumulatedToolResults : undefined,
      structuredCards: accumulatedStructuredCards.length > 0 ? accumulatedStructuredCards : undefined,
    });

    await conversation.save();

    return {
      success: true,
      conversationId: conversation._id,
      title: conversation.title,
      tripId: conversation.tripId,
      message: {
        role: 'assistant',
        content: finalAssistantReply,
        provider: finalProvider,
        model: finalModel,
        createdAt: new Date(),
        structuredCards: accumulatedStructuredCards,
      },
      sources: accumulatedToolResults.map((tr) => tr.toolName),
      places: accumulatedStructuredCards.filter((c) => c.type === 'place').map((c) => c.data),
    };
  }

  /**
   * Get user's conversation history list
   */
  public async getHistory(userId: string) {
    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate('tripId', 'destination dates duration')
      .select('_id title tripId messages updatedAt createdAt');

    return conversations.map((c) => {
      const lastMsg = c.messages[c.messages.length - 1];
      return {
        conversationId: c._id,
        title: c.title,
        trip: c.tripId,
        messageCount: c.messages.length,
        lastMessage: lastMsg ? lastMsg.content.slice(0, 80) : '',
        lastMessageRole: lastMsg?.role,
        updatedAt: c.updatedAt,
      };
    });
  }

  /**
   * Get full conversation details
   */
  public async getConversation(userId: string, conversationId: string) {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new NotFoundError('Invalid conversation ID.');
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId }).populate(
      'tripId',
      'destination dates duration budget'
    );

    if (!conversation) {
      throw new NotFoundError('Conversation not found or access denied.');
    }

    return conversation;
  }

  /**
   * Delete conversation
   */
  public async deleteConversation(userId: string, conversationId: string) {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new NotFoundError('Invalid conversation ID.');
    }

    const deleted = await Conversation.findOneAndDelete({ _id: conversationId, userId });
    if (!deleted) {
      throw new NotFoundError('Conversation not found or access denied.');
    }

    return { message: 'Conversation deleted successfully.' };
  }

  /**
   * Explicitly apply an assistant-suggested itinerary modification
   */
  public async applyItinerarySuggestion(userId: string, input: ApplySuggestionInput) {
    const { tripId, dayNumber, slot, newActivity } = input;

    const trip = await Trip.findOne({ _id: tripId, userId });
    if (!trip) {
      throw new ForbiddenError('Trip not found or does not belong to you.');
    }

    const itinerary = await Itinerary.findOne({ tripId, userId }).sort({ version: -1 });
    if (!itinerary) {
      throw new NotFoundError('No itinerary found for this trip to modify.');
    }

    const targetDay = itinerary.days.find((d) => d.dayNumber === dayNumber);
    if (!targetDay) {
      throw new NotFoundError(`Day ${dayNumber} not found in this itinerary.`);
    }

    const activityToInsert: any = {
      name: newActivity.name,
      description: newActivity.description || 'Customized experience suggested by VoyageAI Assistant',
      duration: newActivity.duration || '2.5 hours',
      cost: String(newActivity.cost ?? '0'),
      transportation: 'Local Transport',
    };

    if (slot === 'morning') {
      targetDay.morning = [activityToInsert];
    } else if (slot === 'afternoon') {
      targetDay.afternoon = [activityToInsert];
    } else if (slot === 'evening') {
      targetDay.evening = [activityToInsert];
    }

    itinerary.markModified('days');
    await itinerary.save();

    return {
      success: true,
      message: `Successfully updated Day ${dayNumber} (${slot}) with "${newActivity.name}".`,
      itinerary,
    };
  }
}

export const chatService = new ChatService();
