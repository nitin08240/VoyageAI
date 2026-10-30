require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');
const { buildItineraryPrompt } = require('../dist/modules/ai/prompt.builder');
const { geminiItineraryResponseSchema } = require('../dist/modules/ai/response.schema');
const { validateBudgetConsistency, recalculateTotals } = require('../dist/utils/budget');

async function runDemo() {
  console.log('🚀 Running VoyageAI Gemini Itinerary Generation Flow...');

  const sampleTrip = {
    destination: {
      city: 'Kyoto',
      country: 'Japan',
      name: 'Kyoto'
    },
    startingLocation: 'Tokyo, Japan',
    dates: {
      start: new Date('2026-11-10'),
      end: new Date('2026-11-12'),
      departure: '2026-11-10',
      return: '2026-11-12'
    },
    duration: 3,
    travellers: {
      adults: 2,
      children: 0,
      infants: 0,
      type: 'couple'
    },
    budget: {
      total: 2500,
      currency: 'USD',
      category: 'mid-range',
      perPerson: false
    },
    preferences: {
      interests: ['Culture', 'Temples', 'Food', 'Gardens'],
      accommodation: 'Traditional Machiya / Boutique Hotel',
      transportation: 'Public transit & walking',
      food: 'Authentic Kaiseki & Ramen, vegetarian-friendly',
      additionalRequirements: 'Prefer peaceful mornings and quiet evenings'
    }
  };

  const prompt = buildItineraryPrompt(sampleTrip);
  console.log('📝 Prompt successfully built (length:', prompt.length, 'chars)');

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log('🤖 Sending request to Google Gemini API (model:', process.env.GEMINI_MODEL || 'gemini-3.8-flash', ')...');

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    contents: prompt,
  });

  const text = response.text || '';
  console.log('📥 Response received from Gemini (length:', text.length, 'chars)');

  // Clean JSON
  const cleanedText = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(cleanedText);
  console.log('✅ Successfully parsed JSON!');

  // Validate with Zod
  const validated = geminiItineraryResponseSchema.parse(parsed);
  console.log('🛡️  Zod Schema Validation PASSED!');
  console.log(`   - Destination: ${validated.overview.destination}`);
  console.log(`   - Duration: ${validated.days.length} days generated`);
  console.log(`   - Hotels recommended: ${validated.hotels.length}`);
  console.log(`   - Restaurants recommended: ${validated.restaurants.length}`);

  // Test Budget Validation
  const recalc = recalculateTotals(validated.budgetBreakdown);
  console.log(`💰 Budget calculation:`);
  console.log(`   - Target Budget: $${sampleTrip.budget.total}`);
  console.log(`   - Calculated Total: $${recalc}`);
  const check = validateBudgetConsistency(validated.budgetBreakdown, sampleTrip.budget.total);
  console.log(`   - Budget Consistency: ${check.valid ? 'PERFECT' : check.message}`);

  // Check Coordinates
  const hasHotelCoords = validated.hotels.some(h => h.coordinates?.lat);
  const hasRestCoords = validated.restaurants.some(r => r.coordinates?.lat);
  console.log(`📍 Coordinates for Leaflet Map:`);
  console.log(`   - Hotels have coordinates: ${hasHotelCoords}`);
  console.log(`   - Restaurants have coordinates: ${hasRestCoords}`);

  console.log('\n🎉 ALL SYSTEMS OPERATIONAL! VoyageAI Gemini integration is complete.');
}

runDemo().catch(err => {
  console.error('❌ Demo flow error:', err);
  process.exit(1);
});

