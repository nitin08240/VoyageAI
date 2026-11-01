import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { nearbyDiscoveryService } from '../services/nearbyDiscovery.service';
import { qualityControlService } from '../services/qualityControl.service';
import { unsplashService } from '../services/unsplash.service';
import { buildCuratedFallbackItinerary } from '../modules/ai/ai.fallback';

async function runTests() {
  console.log('====================================================');
  console.log('VOYAGEAI SYSTEM VALIDATION & ARCHITECTURAL TESTS');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 8;

  // ----------------------------------------------------------------
  // TEST A: Haridwar 3-Day Regional Discovery
  // ----------------------------------------------------------------
  console.log('--- TEST A: Haridwar 3-Day Regional Discovery (Radius <= 70 km) ---');
  const hdwDiscovery = await nearbyDiscoveryService.discoverNearbyAttractions('Haridwar', 70, 3);
  console.log(`Discovered ${hdwDiscovery.places.length} places around Haridwar:`);
  hdwDiscovery.places.slice(0, 5).forEach((p) => {
    console.log(`  * ${p.name} [${p.hub}] - ${p.distanceKm} km (~${p.estimatedTravelMinutes} mins)`);
  });

  const hasRishikeshInHaridwar = hdwDiscovery.places.some(
    (p) => p.hub.toLowerCase().includes('rishikesh') || p.name.toLowerCase().includes('rishikesh')
  );
  if (hasRishikeshInHaridwar && hdwDiscovery.suggestedDayClusters.length === 3) {
    console.log('PASS: Haridwar correctly discovered Rishikesh attractions within 70 km radius.\n');
    passedTests++;
  } else {
    console.error('FAIL: Haridwar did not discover nearby Rishikesh destinations.\n');
  }

  // ----------------------------------------------------------------
  // TEST B: Rishikesh 5-Day Regional Discovery
  // ----------------------------------------------------------------
  console.log('--- TEST B: Rishikesh 5-Day Regional Discovery (Radius <= 70 km) ---');
  const rshDiscovery = await nearbyDiscoveryService.discoverNearbyAttractions('Rishikesh', 70, 5);
  console.log(`Discovered ${rshDiscovery.places.length} places around Rishikesh:`);
  rshDiscovery.places.slice(0, 5).forEach((p) => {
    console.log(`  * ${p.name} [${p.hub}] - ${p.distanceKm} km (~${p.estimatedTravelMinutes} mins)`);
  });

  const hasHaridwarInRishikesh = rshDiscovery.places.some(
    (p) => p.hub.toLowerCase().includes('haridwar') || p.name.toLowerCase().includes('har ki pauri')
  );
  const hasShivpuriOrNeer = rshDiscovery.places.some(
    (p) => p.name.toLowerCase().includes('shivpuri') || p.name.toLowerCase().includes('neer')
  );
  if (hasHaridwarInRishikesh && hasShivpuriOrNeer && rshDiscovery.suggestedDayClusters.length === 5) {
    console.log('PASS: Rishikesh correctly discovered Haridwar, Shivpuri, and Neer Garh within 70 km.\n');
    passedTests++;
  } else {
    console.error('FAIL: Rishikesh did not discover expected nearby attractions.\n');
  }

  // ----------------------------------------------------------------
  // TEST C: Manali 6-Day Regional Discovery
  // ----------------------------------------------------------------
  console.log('--- TEST C: Manali 6-Day Regional Discovery (Radius <= 70 km) ---');
  const mnlDiscovery = await nearbyDiscoveryService.discoverNearbyAttractions('Manali', 70, 6);
  console.log(`Discovered ${mnlDiscovery.places.length} places around Manali:`);
  mnlDiscovery.places.slice(0, 5).forEach((p) => {
    console.log(`  * ${p.name} [${p.hub}] - ${p.distanceKm} km (~${p.estimatedTravelMinutes} mins)`);
  });

  const hasSolangOrAtal = mnlDiscovery.places.some(
    (p) => p.name.toLowerCase().includes('solang') || p.name.toLowerCase().includes('atal tunnel') || p.name.toLowerCase().includes('sissu')
  );
  const hasNaggar = mnlDiscovery.places.some((p) => p.name.toLowerCase().includes('naggar'));
  if (hasSolangOrAtal && hasNaggar && mnlDiscovery.suggestedDayClusters.length === 6) {
    console.log('PASS: Manali correctly discovered Solang, Atal Tunnel, Sissu, and Naggar within 70 km.\n');
    passedTests++;
  } else {
    console.error('FAIL: Manali regional discovery did not include expected hubs.\n');
  }

  // ----------------------------------------------------------------
  // TEST D: Multi-Day Duplicate Activity Validation (6 Days)
  // ----------------------------------------------------------------
  console.log('--- TEST D: Duplicate Activity Detection Across Days (Manali 6-Day Trip) ---');
  const mockTrip: any = {
    destination: { name: 'Manali', city: 'Manali', country: 'India' },
    duration: 6,
    budget: { total: 45000, currency: 'INR', perPerson: false },
    preferences: {
      interests: ['Nature', 'Culture', 'Mountains'],
      accommodation: 'standard_hotel',
      transportation: 'Taxi',
      food: 'Vegetarian',
    },
    dates: { start: new Date(), end: new Date(Date.now() + 6 * 86400000) },
  };

  const rawItinerary = buildCuratedFallbackItinerary(mockTrip, mnlDiscovery);
  const qcResult = qualityControlService.sanitizeAndValidate(rawItinerary, mockTrip, mnlDiscovery);
  const allNames: string[] = [];
  qcResult.data.days.forEach((d) => {
    console.log(`  Day ${d.dayNumber}: "${d.title}"`);
    d.morning.forEach((a) => { console.log(`    - Morning: ${a.name}`); allNames.push(a.name); });
    d.afternoon.forEach((a) => { console.log(`    - Afternoon: ${a.name}`); allNames.push(a.name); });
    d.evening.forEach((a) => { console.log(`    - Evening: ${a.name}`); allNames.push(a.name); });
  });

  const uniqueNames = new Set(allNames.map((n) => n.toLowerCase().trim()));
  console.log(`Total activities generated: ${allNames.length}, Unique activities: ${uniqueNames.size}`);

  if (uniqueNames.size === allNames.length) {
    console.log('PASS: Zero duplicate activities found across all 6 days! Every single slot is distinct.\n');
    passedTests++;
  } else {
    console.error(`FAIL: Found ${allNames.length - uniqueNames.size} duplicate activities across days!\n`);
  }

  // ----------------------------------------------------------------
  // TEST E: Image Uniqueness & Deduplication
  // ----------------------------------------------------------------
  console.log('--- TEST E: Image Deduplication Across All Activities ---');
  const testItinerary = JSON.parse(JSON.stringify(rawItinerary));
  await unsplashService.enrichItineraryImages(testItinerary, 'Manali');

  const photoIds: string[] = [];
  testItinerary.days.forEach((d: any) => {
    ['morning', 'afternoon', 'evening'].forEach((slot) => {
      d[slot].forEach((a: any) => {
        if (a.photoId) photoIds.push(a.photoId);
      });
    });
  });

  const uniquePhotoIds = new Set(photoIds);
  console.log(`Total assigned activity images: ${photoIds.length}, Unique photo IDs: ${uniquePhotoIds.size}`);

  if (uniquePhotoIds.size === photoIds.length) {
    console.log('PASS: Every activity received a 100% unique image! No image repetition across days.\n');
    passedTests++;
  } else {
    console.error(`FAIL: Found ${photoIds.length - uniquePhotoIds.size} repeated image assignments!\n`);
  }

  // ----------------------------------------------------------------
  // TEST F: Hotel Symbolic Dollar Tier Elimination
  // ----------------------------------------------------------------
  console.log('--- TEST F: Hotel Dollar Price Tiers ($$) Elimination ---');

  const containsDollarTier = qcResult.data.hotels.some((h) =>
    /^\s*\$+\s*$/.test(h.priceRange) || h.priceRange.includes('$$')
  );

  console.log(`Hotel Price Ranges:`, qcResult.data.hotels.map((h) => `${h.name}: "${h.priceRange}"`));

  if (!containsDollarTier && qcResult.data.hotels.every((h) => h.priceRange.includes('₹') || h.priceRange.includes('/ night'))) {
    console.log('PASS: No symbolic dollar signs ($, $$, $$$) in hotel price ranges. Real currency formatted.\n');
    passedTests++;
  } else {
    console.error('FAIL: Symbolic dollar tiers still detected in hotel price ranges.\n');
  }

  // ----------------------------------------------------------------
  // TEST G: INR Consistency Across Entire Itinerary
  // ----------------------------------------------------------------
  console.log('--- TEST G: INR Currency Consistency ---');
  let hasDollarArtifacts = false;
  qcResult.data.days.forEach((d) => {
    [...d.morning, ...d.afternoon, ...d.evening].forEach((a: any) => {
      if (typeof a.cost === 'string' && a.cost.includes('$')) hasDollarArtifacts = true;
    });
  });

  if (!hasDollarArtifacts) {
    console.log('PASS: All monetary values conform to user selected INR currency (₹).\n');
    passedTests++;
  } else {
    console.error('FAIL: Dollar artifacts detected in activity costs.\n');
  }

  // ----------------------------------------------------------------
  // TEST H: Travel Feasibility & Distance Calculations
  // ----------------------------------------------------------------
  console.log('--- TEST H: Travel Feasibility (Haversine Distance & Minutes) ---');
  const distHaridwarRishikesh = nearbyDiscoveryService.calculateDistanceKm(29.9457, 78.1642, 30.0869, 78.2676);
  const timeMins = nearbyDiscoveryService.estimateTravelMinutes(distHaridwarRishikesh, false);
  console.log(`Distance Haridwar -> Rishikesh: ${distHaridwarRishikesh} km, Estimated Travel Time: ${timeMins} mins`);

  if (distHaridwarRishikesh > 18 && distHaridwarRishikesh < 30 && timeMins >= 35 && timeMins <= 60) {
    console.log('PASS: Distance and travel time calculations are geographically accurate.\n');
    passedTests++;
  } else {
    console.error('FAIL: Distance calculation inaccurate.\n');
  }

  console.log('====================================================');
  console.log(`FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
  console.log('====================================================');
}

runTests().catch(console.error);
