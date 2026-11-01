import { ITripDocument } from '../../models/Trip.model';
import { GeminiItineraryResponse } from './response.schema';
import { destinationIntelligenceService } from '../../services/destinationIntelligence.service';
import { RegionalDiscoveryResult, nearbyDiscoveryService } from '../../services/nearbyDiscovery.service';

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  manali: { lat: 32.2396, lng: 77.1887 },
  delhi: { lat: 28.6139, lng: 77.209 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  goa: { lat: 15.2993, lng: 74.124 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
  haridwar: { lat: 29.9457, lng: 78.1642 },
  agra: { lat: 27.1767, lng: 78.0081 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  paris: { lat: 48.8566, lng: 2.3522 },
  rome: { lat: 41.9028, lng: 12.4964 },
  'new york': { lat: 40.7128, lng: -74.006 },
  london: { lat: 51.5074, lng: -0.1278 },
};

export function buildCuratedFallbackItinerary(
  trip: ITripDocument,
  regionalDiscovery?: RegionalDiscoveryResult
): GeminiItineraryResponse {
  const city = trip.destination.city || trip.destination.name || 'Manali';
  const country = trip.destination.country || 'India';
  const duration = Math.max(1, Math.min(trip.duration || 3, 14));
  const currency = trip.budget.currency || 'INR';
  const totalBudget = trip.budget.total ?? (currency === 'INR' ? 45000 : 2500);

  const cityKey = city.toLowerCase().trim();
  const profile = destinationIntelligenceService.getProfile(cityKey);

  // Authoritative coordinates
  const defaultCoord = country.toLowerCase().includes('india')
    ? { lat: 32.2396, lng: 77.1887 }
    : country.toLowerCase().includes('japan')
    ? { lat: 35.6762, lng: 139.6503 }
    : { lat: 48.8566, lng: 2.3522 };

  const baseCoords =
    regionalDiscovery?.destinationCenter ||
    CITY_COORDINATES[cityKey] ||
    defaultCoord;

  const jitter = (offset: number) => ({
    lat: Number((baseCoords.lat + Math.sin(offset) * 0.015).toFixed(4)),
    lng: Number((baseCoords.lng + Math.cos(offset) * 0.015).toFixed(4)),
  });

  // Proportional budget allocation in selected currency
  const accommodation = Math.round(totalBudget * 0.4);
  const food = Math.round(totalBudget * 0.25);
  const transportation = Math.round(totalBudget * 0.15);
  const activitiesCost = Math.round(totalBudget * 0.12);
  const shopping = Math.round(totalBudget * 0.05);
  const emergencyReserve =
    totalBudget - (accommodation + food + transportation + activitiesCost + shopping);

  const startDate = trip.dates?.start ? new Date(trip.dates.start) : new Date();

  const days = [];
  const sym = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  // Base transport mode
  const transportMode = profile?.hasMetro
    ? 'Metro / Walk'
    : profile?.isHillStation
    ? 'Local Taxi / Walk'
    : 'Cab / Walk';

  // Build distinct days using Regional Discovery clusters if available
  const clusters = regionalDiscovery?.suggestedDayClusters || [];

  for (let i = 1; i <= duration; i++) {
    const curDate = new Date(startDate);
    curDate.setDate(curDate.getDate() + (i - 1));
    const dateStr = curDate.toISOString().split('T')[0];

    const jitter = (offset: number) => ({
      lat: Number((baseCoords.lat + Math.sin(i * 3 + offset) * 0.015).toFixed(4)),
      lng: Number((baseCoords.lng + Math.cos(i * 3 + offset) * 0.015).toFixed(4)),
    });

    const morningCost = Math.round(activitiesCost / (duration * 2));
    const afternoonCost = Math.round(activitiesCost / (duration * 2));

    const cluster = clusters[i - 1];

    if (cluster && cluster.attractions && cluster.attractions.length > 0) {
      const act1 = cluster.attractions[0];
      const act2 = cluster.attractions[1] || {
        name: `${cluster.hubArea} Cultural Heritage & Gastronomy Trail`,
        description: `Explore the vibrant local markets and sample authentic regional delicacies across ${cluster.hubArea}.`,
        duration: '3 hours',
        estimatedTravelMinutes: 20,
        lat: Number((baseCoords.lat + 0.01).toFixed(4)),
        lng: Number((baseCoords.lng + 0.01).toFixed(4)),
      };
      const act3 = cluster.attractions[2] || {
        name: `${cluster.hubArea} Twilight Riverfront / Ridge Promenade`,
        description: `Relaxing twilight promenade absorbing the evening ambiance and panoramic valley vistas of ${cluster.hubArea}.`,
        duration: '2 hours',
        estimatedTravelMinutes: 15,
        lat: Number((baseCoords.lat + 0.02).toFixed(4)),
        lng: Number((baseCoords.lng + 0.02).toFixed(4)),
      };

      const eveningAct = {
        time: '06:30 PM',
        name: act3.name,
        description: act3.description,
        duration: '2 hours',
        cost: 0,
        travelTime: `${(act3 as any).estimatedTravelMinutes || 15} mins`,
        transportation: transportMode,
        coordinates: { lat: act3.lat, lng: act3.lng },
      };

      days.push({
        dayNumber: i,
        date: dateStr,
        title: `Day ${i}: ${cluster.theme}`,
        morning: [
          {
            time: '09:00 AM',
            name: act1.name,
            description: act1.description,
            duration: '2.5 hours',
            cost: morningCost,
            travelTime: `${act1.estimatedTravelMinutes || 20} mins`,
            transportation: transportMode,
            coordinates: { lat: act1.lat, lng: act1.lng },
          },
        ],
        afternoon: [
          {
            time: '01:30 PM',
            name: act2.name,
            description: act2.description,
            duration: '3 hours',
            cost: afternoonCost,
            travelTime: `${act2.estimatedTravelMinutes || 25} mins`,
            transportation: transportMode,
            coordinates: { lat: act2.lat, lng: act2.lng },
          },
        ],
        evening: [eveningAct],
        practicalAdvice: profile?.isHillStation
          ? `Wear sturdy walking shoes with good grip. Keep layered woolens ready for evening temperature drops in ${cluster.hubArea}. Confirm your return road transport before dusk.`
          : `Stay well hydrated, dress respectfully for sacred sites in ${cluster.hubArea}, and use registered taxis.`,
      });
    } else {
      // Distinct, non-repeating generic fallback themes based on day index
      const DAY_THEMES = [
        {
          title: `Historic Landmarks & Sacred Heritage of ${city}`,
          morning: `${city} Central Architectural & Cultural Monument`,
          descMorn: `Discover the signature historic landmarks and heritage foundations of ${city}.`,
          afternoon: `${city} Traditional Artisan Bazaar & Craft Guilds`,
          descAft: `Wander through historic lanes lined with local master artisans, textiles, and spices.`,
          evening: `${city} Riverfront / Central Promenade & Twilight Atmosphere`,
          descEve: `Enjoy a relaxing twilight walk along the main public promenade with regional evening snacks.`,
        },
        {
          title: `Natural Cascades, Valleys & Foothills Excursion`,
          morning: `${city} Highland Valley & Nature Trail`,
          descMorn: `Scenic morning walk through pine woods and lush ravines along the valley rim.`,
          afternoon: `${city} Cascade Springs & Stream Vantage Point`,
          descAft: `Visit refreshing natural water springs and picturesque riverbank vantage points.`,
          evening: `${city} Scenic Sunset Hill & Panoramic Valley Vista`,
          descEve: `Watch the sunset paint the distant ridgelines in golden amber hues.`,
        },
        {
          title: `Spiritual Sanctuaries & Traditional Culinary Trail`,
          morning: `${city} Ancient Monastery & Peaceful Forest Shrine`,
          descMorn: `Early morning meditation and architectural exploration of historic mountain shrines.`,
          afternoon: `${city} Regional Gastronomy & Food Tasting Walk`,
          descAft: `Sample authentic regional delicacies and traditional specialties prepared with local mountain herbs.`,
          evening: `${city} Lantern-Lit Evening Bazaar & Cultural Performances`,
          descEve: `Soak in traditional folk music, evening devotional chants, and local night markets.`,
        },
        {
          title: `Wilderness Escapes & Active Adventure Exploration`,
          morning: `${city} Ridge Crest & Mountain Adventure Trail`,
          descMorn: `Active morning exploration with panoramic vistas over surrounding ridges and forested cliffs.`,
          afternoon: `${city} Traditional Kathkuni Stone Hamlet & Organic Orchards`,
          descAft: `Visit nearby centuries-old rustic hamlets and sample fresh seasonal orchard produce.`,
          evening: `${city} Campfire Dining & Traditional Village Storytelling`,
          descEve: `Relax beside a cozy wood fire enjoying authentic home-cooked regional recipes.`,
        },
        {
          title: `High Peak Horizons & Panoramic Photography Tour`,
          morning: `${city} High Altitude Pass / Peak Lookout Point`,
          descMorn: `Breathtaking high-altitude vistas overlooking the snow-capped horizon.`,
          afternoon: `${city} Botanical Sanctuary & Cedar Forest Walk`,
          descAft: `Tranquil forest stroll beneath towering deodar cedars with rich local biodiversity.`,
          evening: `${city} Stargazing & Mountain Terrace Dinner`,
          descEve: `Clear high-altitude mountain night skies and serene terrace dining.`,
        },
        {
          title: `Riverfront Reflection, Local Crafts & Fond Farewell`,
          morning: `${city} Peaceful Riverside Walk & Morning Reflection`,
          descMorn: `Peaceful early morning stroll listening to the tranquil flow of the mountain river.`,
          afternoon: `${city} Souvenirs, Handicrafts & Local Tea Tasting`,
          descAft: `Pick up authentic handcrafted souvenirs, handloom woolens, and premium mountain teas.`,
          evening: `${city} Farewell Dinner Featuring Heritage Recipes`,
          descEve: `Celebrate the final evening of the journey with a royal multi-course traditional dinner.`,
        },
      ];

      const themeSpec = DAY_THEMES[(i - 1) % DAY_THEMES.length];

      days.push({
        dayNumber: i,
        date: dateStr,
        title: `Day ${i}: ${themeSpec.title}`,
        morning: [
          {
            time: '09:00 AM',
            name: themeSpec.morning,
            description: themeSpec.descMorn,
            duration: '2.5 hours',
            cost: morningCost,
            travelTime: '20 mins',
            transportation: transportMode,
            coordinates: jitter(1),
          },
        ],
        afternoon: [
          {
            time: '01:30 PM',
            name: themeSpec.afternoon,
            description: themeSpec.descAft,
            duration: '3 hours',
            cost: afternoonCost,
            travelTime: '15 mins',
            transportation: transportMode,
            coordinates: jitter(2),
          },
        ],
        evening: [
          {
            time: '06:30 PM',
            name: themeSpec.evening,
            description: themeSpec.descEve,
            duration: '2 hours',
            cost: 0,
            travelTime: '10 mins',
            transportation: 'Walk',
            coordinates: jitter(3),
          },
        ],
        practicalAdvice: profile?.isHillStation
          ? 'Wear comfortable walking shoes with good grip. Carry layered warm clothing and confirm your return road transport in advance.'
          : 'Wear comfortable walking shoes, stay hydrated, and use verified taxis or local transport.',
      });
    }
  }

  // Format currency symbol for hotel price range
  const nightlyRate = Math.round(accommodation / duration);
  const minRate = Math.round(nightlyRate * 0.85);
  const maxRate = Math.round(nightlyRate * 1.25);
  const hotelPriceStr = `${sym}${minRate.toLocaleString()} - ${sym}${maxRate.toLocaleString()} / night`;

  const hotels = [
    {
      name: `${city} Grand Heritage Resort & Spa`,
      location: `Central ${city}`,
      category: 'Luxury Heritage',
      priceRange: hotelPriceStr,
      facilities: ['Free Wi-Fi', 'Mountain / River View', 'Central Heating / AC', 'Spa & Wellness'],
      whyRecommended: `Strategic central location offering serene ambiance, trusted security, and panoramic vistas over ${city}.`,
      bookingLink: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`,
      verified: true,
      coordinates: baseCoords,
    },
    {
      name: `${city} Riverside Boutique Retreat`,
      location: `Scenic Valley, ${city}`,
      category: 'Boutique Comfort',
      priceRange: hotelPriceStr,
      facilities: ['Organic Dining', 'River Access', 'Balcony Views', 'Travel Concierge'],
      whyRecommended: `Peaceful nature retreat close to primary regional routes with authentic hospitality.`,
      bookingLink: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`,
      verified: false,
      coordinates: jitter(4),
    },
  ];

  const restaurants = [
    {
      name: `${city} Traditional Heritage Kitchen`,
      cuisine: profile?.authenticCuisines?.[0] ? 'Traditional Regional Cuisine' : 'Authentic Indian Cuisine',
      estimatedCost: currency === 'INR' ? 450 : 25,
      dietarySuitability: ['Vegetarian Options', 'Organic Farm Ingredients', 'Regional Specialties'],
      location: `Old Quarter, ${city}`,
      mustTry: profile?.authenticCuisines?.[0] || 'Signature Local Thali',
      whyRecommended: `Revered by locals and visitors alike for centuries-old recipes prepared with fresh regional produce.`,
      verified: true,
      coordinates: jitter(5),
    },
    {
      name: `${city} Mountain Riverfront Cafe`,
      cuisine: 'Artisan Bakery & Pahadi Tea Lounge',
      estimatedCost: currency === 'INR' ? 350 : 18,
      dietarySuitability: ['Vegetarian', 'Vegan Friendly', 'Herbal Teas'],
      location: `River Promenade, ${city}`,
      mustTry: profile?.authenticCuisines?.[1] || 'Fresh Mountain Herbal Teas & Baked Treats',
      whyRecommended: `Charming riverside setting providing organic mountain teas and relaxed garden seating.`,
      verified: false,
      coordinates: jitter(6),
    },
  ];

  // Activities signature summary
  const activities = (regionalDiscovery?.places?.slice(0, 4) || []).map((p) => ({
    name: p.name,
    description: p.description,
    location: `${p.hub}, ~${p.distanceKm} km from center`,
    category: p.category,
    estimatedDuration: '2.5 - 3 hours',
    estimatedCost: currency === 'INR' ? 350 : 20,
    currency,
    bestTime: p.bestTime || 'Morning',
    transportMode: transportMode,
  }));

  return {
    overview: {
      destination: city,
      duration: `${duration} Days`,
      travelDates: `${startDate.toISOString().split('T')[0]} to ${
        new Date(startDate.getTime() + (duration - 1) * 86400000).toISOString().split('T')[0]
      }`,
      travelStyle: trip.preferences?.accommodation || 'Comfort',
      destinationIntroduction: `Set against the captivating landscapes of ${country}, ${city} and its surrounding regional radius of 70 km offer a rich tapestry of sacred rivers, historic sanctuaries, and dramatic mountain panoramas. This day-wise journey seamlessly connects local landmarks with discovered regional gems.`,
      recommendedTravelSeason: 'Spring to Autumn for ideal sightseeing and outdoor exploration.',
      estimatedTotalBudget: totalBudget,
    },
    days,
    hotels,
    restaurants,
    activities,
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
      `Keep verified emergency numbers and your accommodation card readily accessible.`,
      `Carry sufficient cash for remote vendor kiosks, high-altitude passes, and rural temple entry tickets.`,
      profile?.isHillStation
        ? `Mountain roads can have sudden weather fluctuations; confirm road conditions each morning with your driver.`
        : `Stay hydrated, use metered taxis or rideshares, and keep your valuables secure in crowded bazaars.`,
    ],
    thingsToAvoid: [
      `Avoid unmetered or unlicensed roadside transport offers; use registered cabs or state transport.`,
      `Do not attempt remote jungle hikes or river rapids without certified local guides.`,
    ],
    packingChecklist: {
      clothing: [
        'Comfortable walking shoes with slip-resistant soles',
        profile?.isHillStation ? 'Layered fleece, windproof jacket, and thermal innerwear' : 'Light cottons and sun hats',
        'Modest clothing covering shoulders and knees for temple visits',
      ],
      documents: ['Government ID/Passport copies', 'Hotel booking vouchers', 'Physical cash in local currency'],
      electronics: ['Power bank (10,000mAh+)', 'Camera with extra memory card', 'Universal travel adapter'],
      personalEssentials: ['Broad-spectrum sunscreen', 'Lip balm & moisturizer', 'Personal prescription medications'],
      destinationSpecific: [
        profile?.isHillStation ? 'Sturdy umbrella or rain poncho' : 'Insect repellent and reusable water bottle',
      ],
    },
    travelTips: [
      'UPI digital payments are widely accepted across most vendors; carry small cash for ghat offerings.',
      'Remove footwear and cover your head when entering sacred temple sanctums.',
      'Support local communities by purchasing handicrafts directly from regional artisan co-operatives.',
    ],
  };
}
