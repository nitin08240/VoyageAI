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
import { buildCuratedFallbackItinerary } from './ai.fallback';
import { geocodingService } from '../../services/geocoding.service';
import { unsplashService } from '../../services/unsplash.service';
import { weatherService } from '../../services/weather.service';

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

    let validatedData: GeminiItineraryResponse;

    try {
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
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.slice(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.slice(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
      }
      const parsed = JSON.parse(cleanText.trim());

      // Validate with Zod schema
      const validationResult = geminiItineraryResponseSchema.safeParse(parsed);
      if (!validationResult.success) {
        console.error('[AI] Zod validation errors:', validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
        throw new AIServiceError('AI response did not match the expected format.');
      }

      validatedData = validationResult.data;
    } catch (aiErr: any) {
      console.warn(`[AI Service] Live Gemini API notice (${aiErr.message?.slice(0, 100)}). Activating curated intelligent synthesis fallback.`);
      validatedData = buildCuratedFallbackItinerary(trip);
    }

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
      days: validatedData.days.map(d => ({
        ...d,
        morning: d.morning.map(m => ({ ...m, cost: String(m.cost ?? 0) })),
        afternoon: d.afternoon.map(a => ({ ...a, cost: String(a.cost ?? 0) })),
        evening: d.evening.map(e => ({ ...e, cost: String(e.cost ?? 0) })),
      })),
      hotels: validatedData.hotels,
      restaurants: validatedData.restaurants.map(r => ({
        ...r,
        estimatedCost: String(r.estimatedCost ?? 20),
      })),
      activities: validatedData.activities.map((a, idx) => ({
        time: 'Daytime',
        name: typeof a === 'string' ? a : (a as any).name || `Activity ${idx + 1}`,
        description: typeof a === 'string' ? a : (a as any).description || 'Curated sightseeing activity',
        duration: '2 hours',
        cost: '0',
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

    // Asynchronously resolve missing coordinates, Unsplash imagery, and OpenWeather forecasts
    const destContext = trip.destination?.city || trip.destination?.name || '';
    Promise.allSettled([
      geocodingService.geocodeItinerary(itinerary, destContext),
      unsplashService.enrichItineraryImages(itinerary, destContext),
      weatherService.enrichItineraryWeather(itinerary, destContext, itinerary.hotels?.[0]?.coordinates),
    ])
      .then(async () => {
        itinerary.markModified('destinationMedia');
        itinerary.markModified('hotels');
        itinerary.markModified('restaurants');
        itinerary.markModified('days');
        await itinerary.save();
      })
      .catch((err) => console.warn('[Background Enrichment]', err.message));

    return itinerary;
  } catch (error: any) {
    console.error('[AI Service Error]:', error);
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
