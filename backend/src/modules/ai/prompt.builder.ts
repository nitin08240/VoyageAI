import { destinationIntelligenceService } from '../../services/destinationIntelligence.service';
import { RegionalDiscoveryResult } from '../../services/nearbyDiscovery.service';

export function buildItineraryPrompt(trip: any, regionalDiscovery?: RegionalDiscoveryResult): string {
  const dest = typeof trip.destination === 'string' 
    ? trip.destination 
    : `${trip.destination.city || trip.destination.name}, ${trip.destination.country || ''}`;

  const travellersDesc = `${trip.travellers.adults} adult(s)${trip.travellers.children > 0 ? `, ${trip.travellers.children} children` : ''} (${trip.travellers.type || 'leisure'})`;
  const currency = trip.budget?.currency || 'USD';
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const budgetTotal = trip.budget?.amount ?? trip.budget?.total ?? 2000;
  const budgetDesc = `${currency} ${budgetTotal} (${trip.budget.category || 'balanced'} budget, ${trip.budget.perPerson ? 'per person' : 'total'})`;
  const interests = (trip.preferences?.interests || []).join(', ') || 'Culture, Food, Nature, Sightseeing';

  const startDate = trip.dates?.start ? new Date(trip.dates.start).toISOString().split('T')[0] : 'flexible';
  const endDate = trip.dates?.end ? new Date(trip.dates.end).toISOString().split('T')[0] : 'flexible';

  // Destination intelligence for transport, real landmarks, and regional cuisine
  const destinationRules = destinationIntelligenceService.getPromptTransportContext(dest);

  // Representative cost samples matching the selected currency
  const sampleActivityCost1 = currency === 'INR' ? 250 : currency === 'EUR' ? 18 : 20;
  const sampleActivityCost2 = currency === 'INR' ? 400 : currency === 'EUR' ? 25 : 30;
  const sampleDiningCost = currency === 'INR' ? 450 : currency === 'EUR' ? 25 : 30;
  const sampleHotelPrice = currency === 'INR' ? `${currencySymbol}3,500 - ${currencySymbol}6,000 / night` : `${currencySymbol}120 - ${currencySymbol}190 / night`;

  // Build regional nearby attractions context
  let nearbyContext = '';
  if (regionalDiscovery && regionalDiscovery.places.length > 0) {
    const placesText = regionalDiscovery.places.slice(0, 15).map(p => 
      `  * "${p.name}" (${p.hub}, ${p.distanceKm} km away, ~${p.estimatedTravelMinutes} mins) - Category: ${p.category}. ${p.description}`
    ).join('\n');

    const dayGroupingAdvice = regionalDiscovery.suggestedDayClusters.map(c =>
      `  * Day ${c.dayNumber}: Focus on "${c.hubArea}" (${c.theme})`
    ).join('\n');

    nearbyContext = `
REGIONAL NEARBY DISCOVERY CONTEXT (WITHIN ~70 KM RADIUS):
The user's selected destination "${dest}" is the central starting point for regional discovery, NOT the only permitted place.
You MAY recommend verified attractions and surrounding towns within approximately 70 km, provided they are accessible and practical for the trip duration (${trip.duration} days).
VERIFIED NEARBY ATTRACTIONS DISCOVERED WITHIN 70 KM:
${placesText}

RECOMMENDED DAY-WISE GEOGRAPHIC CLUSTERS:
${dayGroupingAdvice}
`;
  }

  return `You are a world-class luxury regional travel architect and destination specialist AI. Generate a comprehensive, realistic, day-by-day travel itinerary strictly matching the requirements below.

CRITICAL CONSTRAINTS & ACCURACY RULES:
1. Return VALID, RAW JSON ONLY. No markdown ticks, no backticks, no explanations.
2. Generate EXACTLY ${trip.duration} days in the "days" array, numbered from 1 to ${trip.duration}.
3. STRICT PROHIBITION ON DUPLICATE ACTIVITIES (CRITICAL):
   - EVERY ITINERARY DAY MUST HAVE ITS OWN DISTINCT ACTIVITIES AND ITS OWN DISTINCT THEME.
   - For this ${trip.duration}-day trip:
     * Day 1 MUST explore one specific cluster or neighborhood.
     * Day 2 MUST explore a DIFFERENT area or nearby destination.
     * Day 3 MUST explore another distinct experience (nature, waterfall, or neighboring heritage town).
     * Subsequent days MUST introduce NEW experiences and locations.
   - NEVER repeat the same attraction name, same location, or same description across multiple days!
   - Every single morning, afternoon, and evening activity across all ${trip.duration} days MUST be a unique experience.
4. REGIONAL DISCOVERY AROUND 70 KM RADIUS:
${nearbyContext}
   - Group nearby attractions into sensible daily routes so the traveler does not zigzag back and forth.
   - Respect realistic travel times between hubs (e.g., allow 45-60 mins for road transit between neighboring valleys).
5. ALL MONETARY AMOUNTS MUST BE IN THE SELECTED CURRENCY: ${currency} (${currencySymbol}).
   - EVERY activity 'cost', restaurant 'estimatedCost', and item in 'budgetBreakdown' must be a numeric value in ${currency}.
   - NEVER use USD ($) or small dollar values if the selected currency is ${currency}.
   - The total in 'budgetBreakdown' must match or fit the user's budget of ${currency} ${budgetTotal}.
6. NO DOLLAR-SIGN PRICE TIERS ON HOTELS OR RESTAURANTS:
   - NEVER use symbolic tiers like "$", "$$", "$$$", or "$$$$" anywhere in the JSON.
   - For hotels, "priceRange" MUST be an actual estimated range formatted in ${currency} (e.g. "${sampleHotelPrice}").
   - Highlight authentic local dishes and specialties.
7. DESTINATION TRANSPORT COMPLIANCE (CRITICAL):
${destinationRules}
   - NEVER recommend transport systems that do not exist in ${dest} (e.g. NO Metro or Local Trains in mountain/hill areas).
   - Day advice must reflect realistic weather, walking shoes, local mountain/urban realities, and genuine road transport.
8. REAL LANDMARKS ONLY (NO GENERIC FILLER):
   - Every activity MUST be a real, authentic, recognized landmark, temple, viewpoint, valley, bazaar, or heritage site.
   - DO NOT invent attractions or use generic filler titles like "Cultural Exploration & Scenic Discovery".
9. COORDINATES: Return "coordinates": null for all locations so our backend OpenStreetMap Nominatim engine resolves genuine coordinates. Never copy or hallucinate coordinates.

TRIP PARAMETERS:
- Destination: ${dest}
- Starting Location: ${trip.startingLocation || 'Not specified'}
- Departure Date: ${startDate}
- Return Date: ${endDate}
- Total Duration: ${trip.duration} days
- Travelers: ${travellersDesc}
- User Target Budget: ${budgetDesc}
- Selected Currency: ${currency} (${currencySymbol})
- Accommodation Style: ${trip.preferences?.accommodation || 'Standard Hotel'}
- Preferred Transportation: ${trip.preferences?.transportation || 'Walking, Taxis, and local verified transit'}
- Dietary Preferences: ${trip.preferences?.food || 'No preference'}
- Traveler Interests: ${interests}
- Special Requests & Considerations: ${trip.preferences?.additionalRequirements || 'None'}

REQUIRED JSON STRUCTURE:
{
  "overview": {
    "destination": "${dest}",
    "duration": "${trip.duration} Days",
    "travelDates": "${startDate} to ${endDate}",
    "travelStyle": "${trip.preferences?.accommodation || 'Standard'}",
    "destinationIntroduction": "Captivating editorial summary capturing the genuine character, history, and altitude/atmosphere of ${dest} and its surrounding region...",
    "recommendedTravelSeason": "Ideal months and seasonal highlights for ${dest}",
    "estimatedTotalBudget": ${budgetTotal}
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "${startDate}",
      "title": "Distinct Day 1 Theme (e.g., Historic Temples & Sacred River Ghats)",
      "morning": [
        {
          "time": "09:00 AM",
          "name": "Distinct Landmark Name 1",
          "description": "Engaging description with historical context and practical tips",
          "duration": "2 hours",
          "cost": ${sampleActivityCost1},
          "travelTime": "20 mins",
          "transportation": "Local Taxi / Walk",
          "coordinates": null
        }
      ],
      "afternoon": [
        {
          "time": "01:30 PM",
          "name": "Distinct Afternoon Spot or Culinary Experience",
          "description": "Engaging description of the spot and local cultural nuances",
          "duration": "2.5 hours",
          "cost": ${sampleActivityCost2},
          "travelTime": "15 mins",
          "transportation": "Walk",
          "coordinates": null
        }
      ],
      "evening": [
        {
          "time": "06:30 PM",
          "name": "Distinct Evening Promenade or Twilight Aarti / Sunset Point",
          "description": "Atmospheric evening experience in the area",
          "duration": "2 hours",
          "cost": 0,
          "travelTime": "10 mins",
          "transportation": "Local Taxi / Walk",
          "coordinates": null
        }
      ],
      "practicalAdvice": "Factual local advice for this specific day"
    }
  ],
  "hotels": [
    {
      "name": "Real Well-Known Hotel in ${dest}",
      "location": "Neighborhood/Area, ${dest}",
      "category": "Standard / Luxury / Boutique",
      "priceRange": "${sampleHotelPrice}",
      "facilities": ["Free Wi-Fi", "Mountain View", "Heating / AC", "Central Location"],
      "whyRecommended": "Why this property fits the traveler style and offers great location safety",
      "bookingLink": "https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}",
      "verified": false,
      "coordinates": null
    }
  ],
  "restaurants": [
    {
      "name": "Authentic Eatery or Regional Restaurant in ${dest}",
      "cuisine": "Authentic Regional Cuisine",
      "estimatedCost": ${sampleDiningCost},
      "dietarySuitability": ["Vegetarian options", "Local Specialties"],
      "location": "Street / Area, ${dest}",
      "mustTry": "Specific signature regional dish",
      "whyRecommended": "Why this venue is celebrated for authentic dining",
      "verified": false,
      "coordinates": null
    }
  ],
  "activities": [
    {
      "name": "Signature Regional Experience 1",
      "description": "Why this is an essential signature experience",
      "location": "Area, ${dest}",
      "category": "Sightseeing / Culture / Adventure",
      "estimatedDuration": "3 hours",
      "estimatedCost": ${sampleActivityCost1},
      "currency": "${currency}",
      "bestTime": "Morning",
      "transportMode": "Local Taxi / Walk"
    }
  ],
  "budgetBreakdown": {
    "accommodation": 0,
    "food": 0,
    "transportation": 0,
    "activities": 0,
    "shopping": 0,
    "miscellaneous": 0,
    "emergencyReserve": 0,
    "total": ${budgetTotal}
  },
  "safetyTips": [
    "Factual safety tip for ${dest}",
    "Emergency contacts and healthcare facility info",
    "Local precaution regarding weather, altitude, or terrain"
  ],
  "thingsToAvoid": [
    "Common tourist mistake or overpriced trap in ${dest}",
    "Unsafe travel practice in this specific terrain"
  ],
  "packingChecklist": {
    "clothing": ["Appropriate seasonal clothes for ${dest}", "Comfortable walking shoes"],
    "documents": ["ID/Passport", "Booking confirmations", "Cash in local currency"],
    "electronics": ["Power bank", "Camera", "Chargers"],
    "personalEssentials": ["Sunscreen", "Personal medications", "Lip balm"],
    "destinationSpecific": ["Destination-specific items (e.g., thermal wear / umbrella / woolens)"]
  },
  "travelTips": [
    "Local payment preferences (UPI/Cash/Card)",
    "Altitude and weather acclimatization guidance",
    "Local cultural etiquette and photography permissions"
  ]
}

Ensure the response contains EXACTLY ${trip.duration} days in the days array, each with distinct, non-repeating morning, afternoon, and evening activities. Output ONLY the raw JSON object.`;
}
