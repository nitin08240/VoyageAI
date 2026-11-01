import { GeminiItineraryResponse } from '../modules/ai/response.schema';
import { ITripDocument } from '../models/Trip.model';
import { destinationIntelligenceService } from './destinationIntelligence.service';
import { RegionalDiscoveryResult, DiscoveredPlace } from './nearbyDiscovery.service';

export interface QualityControlResult {
  data: GeminiItineraryResponse;
  warnings: string[];
}

export class QualityControlService {
  /**
   * Run comprehensive quality control on the AI-generated itinerary.
   * Enforces itinerary-wide duplicate validation, destination-aware transport,
   * currency consistency, hotel price tier cleanup, and budget arithmetic.
   */
  public sanitizeAndValidate(
    rawItinerary: GeminiItineraryResponse,
    trip: ITripDocument,
    regionalDiscovery?: RegionalDiscoveryResult
  ): QualityControlResult {
    const warnings: string[] = [];
    const destination = trip.destination?.city || trip.destination?.name || 'Destination';
    const currency = trip.budget?.currency || 'USD';
    const targetBudget = trip.budget?.total ?? 2000;
    const profile = destinationIntelligenceService.getProfile(destination);

    const isINR = currency.toUpperCase() === 'INR';
    const currencySymbol = isINR ? '₹' : currency.toUpperCase() === 'EUR' ? '€' : currency.toUpperCase() === 'GBP' ? '£' : '$';

    const data = { ...rawItinerary };

    // Set of unused replacement attractions discovered within ~70 km radius
    const availableReplacements: DiscoveredPlace[] = [
      ...(regionalDiscovery?.places || []),
    ];

    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();

    // 1. Itinerary-wide activity and day-theme duplicate detection
    const globalSeenActivityNames = new Set<string>();
    const globalSeenDescriptions = new Set<string>();
    const globalSeenDayTitles = new Set<string>();

    data.days = data.days.map((day, dayIndex) => {
      const dayNum = day.dayNumber || dayIndex + 1;
      const slots = ['morning', 'afternoon', 'evening'] as const;
      const sanitizedDay: any = { ...day };

      // Ensure Day Title is distinct
      let dayTitle = sanitizedDay.title || `Day ${dayNum} Exploration`;
      const normTitle = normalize(dayTitle);
      if (globalSeenDayTitles.has(normTitle) || normTitle === 'dayculturalexplorationscenicdiscovery') {
        const cluster = regionalDiscovery?.suggestedDayClusters?.[dayIndex];
        dayTitle = cluster ? `Day ${dayNum}: ${cluster.theme}` : `Day ${dayNum}: Regional Discovery & Highlights of ${destination}`;
        warnings.push(`Deduplicated day title for Day ${dayNum} to "${dayTitle}".`);
      }
      globalSeenDayTitles.add(normalize(dayTitle));
      sanitizedDay.title = dayTitle;

      for (const slot of slots) {
        if (Array.isArray(sanitizedDay[slot])) {
          sanitizedDay[slot] = sanitizedDay[slot].map((act: any) => {
            let actName = act.name || 'Sightseeing Activity';
            const normName = normalize(actName);
            const descSnippet = (act.description || '').slice(0, 35).toLowerCase();

            // Detect duplicate activity across the entire itinerary
            const isDuplicate =
              globalSeenActivityNames.has(normName) ||
              (descSnippet.length > 10 && globalSeenDescriptions.has(descSnippet));

            if (isDuplicate) {
              // Pick an unused replacement attraction from regional discovery
              const unusedIndex = availableReplacements.findIndex(
                (p) => !globalSeenActivityNames.has(normalize(p.name))
              );

              if (unusedIndex !== -1) {
                const rep = availableReplacements.splice(unusedIndex, 1)[0];
                warnings.push(
                  `Replaced duplicate activity "${actName}" on Day ${dayNum} with verified regional attraction "${rep.name}".`
                );
                actName = rep.name;
                act.description = rep.description;
                act.duration = '2.5 hours';
                act.travelTime = `${rep.estimatedTravelMinutes || 20} mins`;
                act.coordinates = { lat: rep.lat, lng: rep.lng };
              } else {
                // If pool exhausted, differentiate with slot context
                actName = `${actName} (${slot === 'morning' ? 'Morning Trail' : slot === 'afternoon' ? 'Cultural Experience' : 'Sunset Promenade'})`;
              }
            }

            globalSeenActivityNames.add(normalize(actName));
            if (act.description) {
              globalSeenDescriptions.add(act.description.slice(0, 35).toLowerCase());
            }

            // Transport sanitization
            let transport = act.transportation || 'Walk';
            if (profile && !profile.hasMetro) {
              transport = destinationIntelligenceService.sanitizeTransportString(transport, destination);
            }

            // Numeric cost normalization
            let numericCost = typeof act.cost === 'string' ? parseFloat(act.cost.replace(/[^0-9.]/g, '')) || 0 : act.cost || 0;

            // Fix currency artifact: If user chose INR but AI outputted small dollar amounts (e.g. 15 or 25)
            if (isINR && numericCost > 0 && numericCost < 60) {
              numericCost = Math.round(numericCost * 20); // convert $15 -> ₹300 realistic local ticket
            }

            return {
              ...act,
              name: actName,
              transportation: transport,
              cost: numericCost,
            };
          });
        }
      }

      // Advice sanitization
      let advice = sanitizedDay.practicalAdvice || '';
      if (profile && !profile.hasLocalTrain && advice.toLowerCase().includes('train')) {
        advice = advice
          .replace(/pre-book express train tickets/gi, 'confirm your return Volvo bus or taxi arrangements')
          .replace(/train tickets?/gi, 'bus or taxi arrangements')
          .replace(/local train/gi, 'local cab');
        warnings.push(`Corrected railway advice to road transport in Day ${day.dayNumber}.`);
      }
      if (!advice.trim()) {
        advice = profile?.isHillStation
          ? 'Wear comfortable walking shoes with good grip. Carry warm layers and confirm your return road transport in advance.'
          : 'Wear comfortable walking shoes, stay hydrated, and use verified taxis or local transit.';
      }
      sanitizedDay.practicalAdvice = advice;

      return sanitizedDay;
    });

    // 2. Sanitize Hotels (Currency, Real Price Range & Absolute Removal of Symbolic $ Tiers)
    data.hotels = data.hotels.map((hotel) => {
      let priceStr = hotel.priceRange || '';

      // Strip symbolic price tiers like "$", "$$", "$$$", "$$$$"
      if (/^[\$\s\-\/tier]+$/i.test(priceStr) || priceStr === '$$' || priceStr === '$$$' || priceStr === '$$$$') {
        priceStr = isINR ? `₹3,500 - ₹6,500 / night` : `$120 - $220 / night`;
        warnings.push(`Cleaned symbolic dollar price tier on hotel "${hotel.name}" to "${priceStr}".`);
      } else if (isINR && (priceStr.includes('$') || !priceStr.includes('₹'))) {
        // Replace $ with ₹ and scale if amount was small dollar
        const nums = priceStr.match(/\d+/g);
        if (nums && nums.length > 0) {
          const baseNum = parseInt(nums[0], 10);
          if (baseNum < 500) {
            priceStr = `₹${baseNum * 35} - ₹${(parseInt(nums[1] || `${baseNum * 1.5}`, 10)) * 35} / night`;
          } else {
            priceStr = `₹${baseNum} / night`;
          }
        } else {
          priceStr = `₹3,500 - ₹6,000 / night`;
        }
      }

      return {
        ...hotel,
        priceRange: priceStr,
      };
    });

    // 3. Sanitize Restaurants (Remove all price tiers like $, $$, $$$)
    data.restaurants = data.restaurants.map((rest: any) => {
      let cost = typeof rest.estimatedCost === 'string'
        ? parseFloat(rest.estimatedCost.replace(/[^0-9.]/g, '')) || 0
        : rest.estimatedCost || 0;

      if (isINR && cost > 0 && cost < 70) {
        cost = Math.round(cost * 18); // convert $20 -> ₹360 meal
      }

      return {
        ...rest,
        estimatedCost: cost,
      };
    });

    // 4. Sanitize Signature Activities
    if (Array.isArray(data.activities)) {
      data.activities = data.activities.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return {
            name: item,
            description: `Signature experience in ${destination}`,
            location: destination,
            category: 'Sightseeing',
            estimatedDuration: '2.5 hours',
            estimatedCost: isINR ? 300 : 20,
            currency,
            bestTime: 'Morning',
            transportMode: profile?.isHillStation ? 'Local Taxi / Walk' : 'Walk',
          };
        }
        return {
          ...item,
          currency: item.currency || currency,
          transportMode: item.transportMode ? destinationIntelligenceService.sanitizeTransportString(item.transportMode, destination) : 'Walk',
        };
      });
    }

    // 5. Budget Breakdown Arithmetic & Consistency
    const bb = data.budgetBreakdown;
    const calcTotal =
      (bb.accommodation || 0) +
      (bb.food || 0) +
      (bb.transportation || 0) +
      (bb.activities || 0) +
      (bb.shopping || 0) +
      (bb.miscellaneous || 0) +
      (bb.emergencyReserve || 0);

    data.budgetBreakdown.total = calcTotal > 0 ? calcTotal : targetBudget;

    if (data.budgetBreakdown.total > targetBudget) {
      warnings.push(
        `Estimated expenses (${currency} ${data.budgetBreakdown.total}) exceed user target budget (${currency} ${targetBudget}).`
      );
    }

    return { data, warnings };
  }
}

export const qualityControlService = new QualityControlService();
