import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env';
import { AI_TIMEOUT_MS, MAX_RETRIES } from '../../config/constants';
import { buildItineraryPrompt } from './prompt.builder';
import { geminiItineraryResponseSchema, GeminiItineraryResponse } from './response.schema';
import { withRetry } from './ai.retry';
import { Itinerary, IItineraryDocument } from '../../models/Itinerary.model';
import { Trip } from '../../models/Trip.model';
import { GenerationJob } from '../../models/GenerationJob.model';
import { AIServiceError } from '../../shared/errors';
import { validateBudgetConsistency, recalculateTotals } from '../../utils/budget';

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * Generate an itinerary for a trip using the Gemini API.
 */
export async function generateItinerary(
  tripId: string,
  userId: string,
  jobId: string
): Promise<IItineraryDocument> {
  const job = await GenerationJob.findById(jobId);
  if (!job) throw new AIServiceError('Generation job not found.');

  try {
    // Update job status
    job.status = 'processing';
    await job.save();

    // Get trip details
    const trip = await Trip.findById(tripId);
    if (!trip) throw new AIServiceError('Trip not found.');

    // Build prompt
    const prompt = buildItineraryPrompt(trip.toJSON() as any);

    // Call Gemini with retry
    const responseText = await withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      try {
        const response = await genAI.models.generateContent({
          model: env.GEMINI_MODEL,
          contents: prompt,
        });

        clearTimeout(timeout);

        const text = response.text;
        if (!text) {
          throw new AIServiceError('Gemini returned an empty response.');
        }
        return text;
      } catch (err: any) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
          throw new AIServiceError('AI request timed out. Please try again.');
        }
        throw err;
      }
    }, MAX_RETRIES, 2000);

    // Parse JSON from response
    let parsed: any;
    try {
      // Strip markdown code blocks if present
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.slice(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.slice(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
      }
      parsed = JSON.parse(cleanText.trim());
    } catch {
      throw new AIServiceError('Failed to parse AI response as JSON.');
    }

    // Validate with Zod schema
    const validationResult = geminiItineraryResponseSchema.safeParse(parsed);
    if (!validationResult.success) {
      console.error('[AI] Zod validation errors:', validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      throw new AIServiceError('AI response did not match the expected format. Please regenerate.');
    }

    const validatedData: GeminiItineraryResponse = validationResult.data;

    // Server-side budget recalculation and validation
    const recalcTotal = recalculateTotals(validatedData.budgetBreakdown);
    validatedData.budgetBreakdown.total = recalcTotal;

    const budgetCheck = validateBudgetConsistency(
      validatedData.budgetBreakdown,
      trip.budget.total
    );

    // Determine the next version number
    const latestItinerary = await Itinerary.findOne({ tripId })
      .sort({ version: -1 })
      .select('version');
    const nextVersion = latestItinerary ? latestItinerary.version + 1 : 1;

    // Transform packing checklist to match model schema
    const packingChecklist = Object.entries(validatedData.packingChecklist).map(
      ([category, items]) => ({
        category,
        items: Array.isArray(items) ? items : [],
      })
    );

    // Build the overview string
    const overview = typeof validatedData.overview === 'string'
      ? validatedData.overview
      : JSON.stringify(validatedData.overview);

    // Save itinerary
    const itinerary = await Itinerary.create({
      userId,
      tripId,
      version: nextVersion,
      overview,
      days: validatedData.days,
      hotels: validatedData.hotels,
      restaurants: validatedData.restaurants,
      activities: validatedData.activities.map(a => ({
        time: '', name: typeof a === 'string' ? a : (a as any).name || '',
        description: typeof a === 'string' ? a : (a as any).description || '',
        duration: '', cost: '0',
      })),
      budgetBreakdown: validatedData.budgetBreakdown,
      safetyTips: validatedData.safetyTips,
      packingChecklist,
      travelTips: validatedData.travelTips,
      thingsToAvoid: validatedData.thingsToAvoid,
      verificationMetadata: {
        generatedBy: 'gemini',
        modelVersion: env.GEMINI_MODEL,
        promptVersion: '1.0',
        validatedAt: new Date(),
        budgetConsistent: budgetCheck.valid,
        warningFlags: budgetCheck.valid ? [] : [budgetCheck.message || 'Budget exceeded'],
      },
      generatedAt: new Date(),
    });

    // Update trip status
    trip.status = 'completed';
    await trip.save();

    // Update job
    job.status = 'completed';
    job.completedAt = new Date();
    (job as any).itineraryId = itinerary._id;
    await job.save();

    return itinerary;
  } catch (error: any) {
    // Update job on failure
    job.status = 'failed';
    job.errorMessage = error.message || 'Unknown error';
    job.errorCode = error.code || 'GENERATION_FAILED';
    job.completedAt = new Date();
    await job.save();

    // Update trip status
    await Trip.findByIdAndUpdate(tripId, { status: 'failed' });

    throw error instanceof AIServiceError
      ? error
      : new AIServiceError('Failed to generate itinerary. Please try again.');
  }
}
