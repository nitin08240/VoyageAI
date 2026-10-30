import { ITrip } from '../../shared/types';

export function buildItineraryPrompt(trip: any): string {
  const dest = typeof trip.destination === 'string' 
    ? trip.destination 
    : `${trip.destination.city || trip.destination.name}, ${trip.destination.country}`;

  const travellersDesc = `${trip.travellers.adults} adult(s)${trip.travellers.children > 0 ? `, ${trip.travellers.children} children` : ''} (${trip.travellers.type || 'leisure'})`;
  const budgetDesc = `${trip.budget.currency} ${trip.budget.total} (${trip.budget.category || 'balanced'} budget, ${trip.budget.perPerson ? 'per person' : 'total'})`;
  const interests = (trip.preferences?.interests || []).join(', ') || 'Culture, Food, Nature, Sightseeing';

  const startDate = trip.dates?.start ? new Date(trip.dates.start).toISOString().split('T')[0] : 'flexible';
  const endDate = trip.dates?.end ? new Date(trip.dates.end).toISOString().split('T')[0] : 'flexible';

  return `You are a world-class travel planner and concierge AI. Generate a comprehensive, realistic, day-by-day travel itinerary strictly matching the requirements below.

CRITICAL CONSTRAINTS:
1. Return VALID, RAW JSON ONLY. No markdown ticks, no backticks, no explanations.
2. Generate EXACTLY ${trip.duration} days in the "days" array, numbered from 1 to ${trip.duration}.
3. The sum of all items in "budgetBreakdown" must not exceed the user's total budget of ${trip.budget.total} ${trip.budget.currency}.
4. Provide geographically sensible routes for each day so travelers do not waste hours commuting.
5. All hotel and restaurant recommendations must be real, well-known establishments in ${dest}. Mark "verified": false to denote AI estimate.
6. Provide distinct morning, afternoon, and evening plans for every single day.

TRIP DETAILS:
- Destination: ${dest}
- Starting Location: ${trip.startingLocation || 'Not specified'}
- Departure Date: ${startDate}
- Return Date: ${endDate}
- Total Duration: ${trip.duration} days
- Travelers: ${travellersDesc}
- Budget: ${budgetDesc}
- Accommodation Style: ${trip.preferences?.accommodation || 'Standard Hotel'}
- Preferred Transportation: ${trip.preferences?.transportation || 'Public transport and walking'}
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
    "destinationIntroduction": "Engaging editorial summary of the destination...",
    "recommendedTravelSeason": "e.g., Spring (April-May) and Autumn (Sept-Oct)",
    "estimatedTotalBudget": ${trip.budget.total}
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "${trip.dates.departure}",
      "title": "Arrival & First Impressions",
      "morning": [
        {
          "time": "09:00 AM",
          "name": "Activity Name",
          "description": "Engaging description with practical tips",
          "duration": "2 hours",
          "cost": 15,
          "travelTime": "20 mins",
          "transportation": "Metro Line 1"
        }
      ],
      "afternoon": [
        {
          "time": "01:30 PM",
          "name": "Activity Name",
          "description": "Engaging description",
          "duration": "2.5 hours",
          "cost": 25,
          "travelTime": "15 mins",
          "transportation": "Walk"
        }
      ],
      "evening": [
        {
          "time": "07:00 PM",
          "name": "Dinner & Night Exploration",
          "description": "Atmospheric evening experience",
          "duration": "2 hours",
          "cost": 35,
          "travelTime": "10 mins",
          "transportation": "Taxi / Walk"
        }
      ],
      "practicalAdvice": "Helpful local tip for Day 1"
    }
  ],
  "hotels": [
    {
      "name": "Hotel Name",
      "location": "Neighborhood, ${dest}",
      "category": "Standard / Luxury / Boutique",
      "priceRange": "$120 - $180 / night",
      "facilities": ["Free Wi-Fi", "Breakfast Included", "Central Location"],
      "whyRecommended": "Why this matches traveler preferences",
      "bookingLink": "https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}",
      "verified": false
    }
  ],
  "restaurants": [
    {
      "name": "Restaurant Name",
      "cuisine": "Local / Authentic",
      "estimatedCost": 25,
      "dietarySuitability": ["Vegetarian options", "Halal"],
      "location": "District / Street name",
      "verified": false
    }
  ],
  "activities": [
    "Must-do experience 1",
    "Hidden gem activity 2",
    "Scenic photo spot 3"
  ],
  "budgetBreakdown": {
    "accommodation": 0,
    "food": 0,
    "transportation": 0,
    "activities": 0,
    "shopping": 0,
    "miscellaneous": 0,
    "emergencyReserve": 0,
    "total": 0
  },
  "safetyTips": [
    "Practical safety advice 1",
    "Local emergency number & hospital info",
    "Scam awareness for this specific city"
  ],
  "thingsToAvoid": [
    "Common tourist mistake 1",
    "Overpriced tourist trap 2"
  ],
  "packingChecklist": {
    "clothing": ["Appropriate seasonal clothes", "Comfortable walking shoes"],
    "documents": ["Passport", "Travel insurance", "Local currency card"],
    "electronics": ["Power adapter type", "Power bank"],
    "personalEssentials": ["Sunscreen", "Medications"],
    "destinationSpecific": ["Items specific to destination weather/culture"]
  },
  "travelTips": [
    "Language & useful phrases",
    "Tipping etiquette",
    "Public transit navigation tips",
    "Local SIM card recommendation"
  ]
}

Ensure the response contains EXACTLY ${trip.duration} days in the days array, each with morning, afternoon, and evening activities. Output ONLY the JSON object.`;
}
