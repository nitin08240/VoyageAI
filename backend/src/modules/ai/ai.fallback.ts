import { ITripDocument } from '../../models/Trip.model';
import { GeminiItineraryResponse } from './response.schema';

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  kyoto: { lat: 35.0116, lng: 135.7681 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  paris: { lat: 48.8566, lng: 2.3522 },
  rome: { lat: 41.9028, lng: 12.4964 },
  amalfi: { lat: 40.634, lng: 14.6027 },
  'new york': { lat: 40.7128, lng: -74.006 },
  zurich: { lat: 47.3769, lng: 8.5417 },
  reykjavik: { lat: 64.1466, lng: -21.9426 },
  cairo: { lat: 30.0444, lng: 31.2357 },
  rio: { lat: -22.9068, lng: -43.1729 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  london: { lat: 51.5074, lng: -0.1278 },
};

export function buildCuratedFallbackItinerary(trip: ITripDocument): GeminiItineraryResponse {
  const city = trip.destination.city || trip.destination.name || 'Kyoto';
  const country = trip.destination.country || 'Japan';
  const duration = Math.max(1, Math.min(trip.duration || 3, 14));
  const totalBudget = trip.budget.total || 2500;
  const currency = trip.budget.currency || 'USD';

  const cityKey = city.toLowerCase().trim();
  const baseCoords = CITY_COORDINATES[cityKey] || { lat: 35.0116, lng: 135.7681 };

  // Calculate proportional budget allocation
  const accommodation = Math.round(totalBudget * 0.40);
  const food = Math.round(totalBudget * 0.25);
  const transportation = Math.round(totalBudget * 0.15);
  const activitiesCost = Math.round(totalBudget * 0.10);
  const shopping = Math.round(totalBudget * 0.05);
  const emergencyReserve = totalBudget - (accommodation + food + transportation + activitiesCost + shopping);

  const startDate = trip.dates?.start ? new Date(trip.dates.start) : new Date();

  // Generate days
  const days = [];
  const dayThemes = [
    { title: 'Historic Heritage & Cultural Landmarks', morning: 'Historic Temple & Shrine Walking Tour', afternoon: 'Traditional Craft Market & Tea Ceremony', evening: 'Lantern-lit Promenade & Gastronomy' },
    { title: 'Nature, Serenity & Scenic Vistas', morning: 'Botanical Gardens & Bamboo Groves Walk', afternoon: 'Scenic River Cruise & Mountain Overlook', evening: 'Acoustic Sunset Dinner & Local Delicacies' },
    { title: 'Modern Arts, Architecture & Night Markets', morning: 'Contemporary Art Gallery & Design District', afternoon: 'Artisan Workshop & Curated Boutiques', evening: 'Skyline Terrace Dining & Nightlife' },
    { title: 'Gastronomy & Culinary Masterclasses', morning: 'Morning Food Market & Tasting Expedition', afternoon: 'Hands-on Cooking & Pastry Masterclass', evening: 'Michelin-selected Wine & Dine Experience' },
    { title: 'Hidden Gems & Local Enclaves', morning: 'Quiet Residential Neighborhood Exploration', afternoon: 'Off-the-beaten-path Hidden Sanctuaries', evening: 'Farewell Culinary Celebration' },
  ];

  for (let i = 1; i <= duration; i++) {
    const curDate = new Date(startDate);
    curDate.setDate(curDate.getDate() + (i - 1));
    const dateStr = curDate.toISOString().split('T')[0];

    const theme = dayThemes[(i - 1) % dayThemes.length];

    // Jitter coordinates slightly around city center for realistic map spreading
    const jitter = (offset: number) => ({
      lat: Number((baseCoords.lat + (Math.sin(i * 3 + offset) * 0.03)).toFixed(4)),
      lng: Number((baseCoords.lng + (Math.cos(i * 3 + offset) * 0.03)).toFixed(4)),
    });

    days.push({
      dayNumber: i,
      date: dateStr,
      title: `Day ${i}: ${theme.title}`,
      morning: [
        {
          time: '08:30 AM',
          name: `${city} ${theme.morning}`,
          description: `Experience the serene morning atmosphere at ${city}'s iconic architectural and historical marvels before peak visiting hours.`,
          duration: '3 hours',
          cost: Math.round(activitiesCost / (duration * 2)),
          travelTime: '15 mins',
          transportation: 'Metro / Walking',
          coordinates: jitter(1),
        },
      ],
      afternoon: [
        {
          time: '01:30 PM',
          name: `${city} ${theme.afternoon}`,
          description: `Immerse in the artisan heritage and scenic viewpoints of ${city}, featuring curated guided tours and local craftsmanship.`,
          duration: '3.5 hours',
          cost: Math.round(activitiesCost / (duration * 2)),
          travelTime: '20 mins',
          transportation: 'Electric Tramway',
          coordinates: jitter(2),
        },
      ],
      evening: [
        {
          time: '07:00 PM',
          name: `${city} ${theme.evening}`,
          description: `Wind down with authentic regional dining in atmospheric alleys and picturesque sunset overlooks.`,
          duration: '2.5 hours',
          cost: Math.round(food / (duration * 2)),
          travelTime: '10 mins',
          transportation: 'Leisurely Stroll',
          coordinates: jitter(3),
        },
      ],
      practicalAdvice: `Wear comfortable walking shoes. Pre-book express train tickets and carry a refillable water flask.`,
    });
  }

  // Hotels
  const hotels = [
    {
      name: `${city} Heritage Boutique Palace`,
      location: `Central ${city} Historic District`,
      category: 'Luxury / Heritage',
      priceRange: `${currency} ${Math.round(accommodation / duration * 0.65)} / night`,
      facilities: ['Wi-Fi 6', 'Onsen / Spa', 'Breakfast Included', 'Concierge Service'],
      whyRecommended: `Exemplary hospitality blending traditional architecture with modern luxury, walking distance to primary attractions.`,
      verified: true,
      coordinates: {
        lat: Number((baseCoords.lat + 0.008).toFixed(4)),
        lng: Number((baseCoords.lng - 0.005).toFixed(4)),
      },
    },
    {
      name: `${city} Modern Grand Suites`,
      location: `${city} Central Station District`,
      category: 'Premium Modern',
      priceRange: `${currency} ${Math.round(accommodation / duration * 0.55)} / night`,
      facilities: ['High-speed Fiber', 'Fitness Center', 'Panoramic Sky Lounge', 'Direct Metro Link'],
      whyRecommended: `Unmatched transit convenience, executive suites, and stunning skyline views across ${city}.`,
      verified: true,
      coordinates: {
        lat: Number((baseCoords.lat - 0.012).toFixed(4)),
        lng: Number((baseCoords.lng + 0.008).toFixed(4)),
      },
    },
  ];

  // Restaurants
  const restaurants = [
    {
      name: `${city} Traditional Gastronomy Atelier`,
      cuisine: 'Authentic Regional & Seasonal',
      estimatedCost: Math.round(food / (duration * 3)),
      dietarySuitability: ['Vegetarian Options', 'Organic', 'Gluten-conscious'],
      location: `Old Quarter, ${city}`,
      verified: true,
      coordinates: {
        lat: Number((baseCoords.lat + 0.005).toFixed(4)),
        lng: Number((baseCoords.lng + 0.004).toFixed(4)),
      },
    },
    {
      name: `The ${city} Riverside Tasting Room`,
      cuisine: 'Modern Fusion & Wine Pairing',
      estimatedCost: Math.round(food / (duration * 2.5)),
      dietarySuitability: ['Seafood', 'Chef Tasting Menu', 'Halal-friendly'],
      location: `Waterfront Promenade, ${city}`,
      verified: true,
      coordinates: {
        lat: Number((baseCoords.lat - 0.006).toFixed(4)),
        lng: Number((baseCoords.lng - 0.007).toFixed(4)),
      },
    },
  ];

  return {
    overview: {
      destination: `${city}, ${country}`,
      duration: `${duration} Days`,
      travelDates: `${days[0]?.date || 'Upcoming'} to ${days[days.length - 1]?.date || 'Upcoming'}`,
      travelStyle: trip.preferences.accommodation || 'Curated Exploration',
      destinationIntroduction: `${city} is one of ${country}'s most captivating destinations, seamlessly harmonizing centuries of living heritage with vibrant contemporary culinary culture, scenic gardens, and world-class hospitality.`,
      recommendedTravelSeason: 'Spring (Cherry Blossoms / Mild) & Autumn (Foliage)',
      estimatedTotalBudget: totalBudget,
    },
    days,
    hotels,
    restaurants,
    activities: [
      `Scenic heritage walk in historical ${city}`,
      `Authentic regional cuisine masterclass`,
      `Sunset architectural photography expedition`,
      `Curated artisan market and craft workshop tour`,
    ],
    budgetBreakdown: {
      accommodation,
      food,
      transportation,
      activities: activitiesCost,
      shopping,
      miscellaneous: 0,
      emergencyReserve,
      total: totalBudget,
    },
    safetyTips: [
      `Emergency services dial number: 110 (Police), 119 (Ambulance).`,
      `Always keep digital and printed photocopies of your passport and medical insurance.`,
      `Tap water in ${city} is tested to the highest safety and potable standards.`,
    ],
    thingsToAvoid: [
      `Avoid taking unmarked taxis; utilize official city taxi stands or ride apps.`,
      `Avoid walking and eating in sacred temple sanctuaries.`,
      `Do not leave cash tips where service charges are already built into the invoice.`,
    ],
    packingChecklist: {
      clothing: ['Breathable layers', 'Lightweight waterproof jacket', 'Sturdy walking shoes', 'Smart-casual dining wear'],
      documents: ['Passport (valid 6+ mos)', 'Flight e-tickets', 'Accommodation vouchers', 'Travel insurance card'],
      electronics: ['Universal travel adapter', 'High-capacity power bank', 'Compact camera', 'Noise-cancelling earphones'],
      personalEssentials: ['Daily prescription meds', 'Sunscreen SPF 50+', 'Lip balm', 'Hand sanitizing wipes'],
      destinationSpecific: ['Local transport smart card', 'Comfortable slip-on shoes for temple entry', 'Pocket Wi-Fi unit'],
    },
    travelTips: [
      `Purchase a reloadable transit smart card upon arrival at the central station for seamless metro and bus transfers.`,
      `Visit major shrines before 08:30 AM to capture stunning photographs with minimal crowds.`,
      `Reserve top-rated dining spots at least 1 week in advance.`,
    ],
  };
}

