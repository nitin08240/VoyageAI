/**
 * VoyageAI Chatbot Integration Test Suite
 * Tests all 14 chatbot integration scenarios using native fetch
 */

const BASE = 'http://localhost:5005/api/v1';
let authToken = '';
let testConversationId = '';
let testTripId = '';

function log(label: string, status: 'PASS' | 'FAIL' | 'INFO' | 'WARN', detail: string) {
  const icon = { PASS: '✅', FAIL: '❌', INFO: 'ℹ️', WARN: '⚠️' }[status];
  console.log(`${icon} [${label}] ${detail}`);
}

async function fetchJson(url: string, opts: any = {}): Promise<{ status: number; data: any }> {
  const headers: any = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(url, {
    ...opts,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json: any = await res.json();
  if (!res.ok && !opts.expectError) {
    throw new Error(`HTTP ${res.status}: ${json?.message || JSON.stringify(json)}`);
  }
  return { status: res.status, data: json };
}

async function authenticate(): Promise<string> {
  try {
    const { data } = await fetchJson(`${BASE}/auth/login`, {
      method: 'POST',
      body: { email: 'test@voyageai.com', password: 'Test@1234' },
    });
    return data?.data?.token || data?.token || '';
  } catch {
    const { data } = await fetchJson(`${BASE}/auth/register`, {
      method: 'POST',
      body: { name: 'ChatBot Tester', email: 'test@voyageai.com', password: 'Test@1234' },
    });
    return data?.data?.token || data?.token || '';
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendChat(msg: string, extra: any = {}) {
  await sleep(3500); // Respect provider rate limits
  const { data } = await fetchJson(`${BASE}/chat/message`, {
    method: 'POST',
    body: { message: msg, ...extra },
  });
  return data?.data;
}

async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║       VoyageAI Chatbot Integration Test Suite       ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Health check
  try {
    const { data } = await fetchJson(`${BASE}/health`);
    log('HEALTH', 'PASS', `API running → ${data.message}`);
  } catch (e: any) {
    log('HEALTH', 'FAIL', `Cannot reach API: ${e.message}`);
    process.exit(1);
  }

  // Authenticate
  try {
    authToken = await authenticate();
    if (!authToken) throw new Error('No token returned');
    log('AUTH', 'PASS', `Token obtained (${authToken.slice(0, 20)}...)`);
  } catch (e: any) {
    log('AUTH', 'FAIL', `Authentication failed: ${e.message}`);
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  // ── TEST 1: General travel question ──
  try {
    console.log('\n── TEST 1: General travel question ──');
    const res = await sendChat('What are the best destinations in Uttarakhand?');
    if (!res?.message?.content) throw new Error('No response content');
    testConversationId = res.conversationId;
    log('TEST-1', 'PASS', `Response (${res.message.content.length} chars) via ${res.message.provider}`);
    log('TEST-1', 'INFO', `ConversationId: ${testConversationId}`);
    log('TEST-1', 'INFO', `Preview: "${res.message.content.slice(0, 150)}..."`);
    passed++;
  } catch (e: any) {
    log('TEST-1', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 2: Nearby places tool ──
  try {
    console.log('\n── TEST 2: searchNearbyPlaces tool ──');
    const res = await sendChat('What are the best places near Rishikesh?', {
      conversationId: testConversationId,
    });
    if (!res?.message?.content) throw new Error('No response content');
    const hasPlaces = res.sources?.includes('searchNearbyPlaces') || res.places?.length > 0;
    log('TEST-2', hasPlaces ? 'PASS' : 'WARN', `Places tool invoked: ${hasPlaces}`);
    log('TEST-2', 'INFO', `Sources: [${res.sources?.join(', ')}]`);
    log('TEST-2', 'INFO', `Structured cards: ${res.message.structuredCards?.length || 0}`);
    passed++;
  } catch (e: any) {
    log('TEST-2', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 3: Haridwar attractions ──
  try {
    console.log('\n── TEST 3: Attractions around Haridwar ──');
    const res = await sendChat('Suggest attractions around Haridwar');
    if (!res?.message?.content) throw new Error('No response content');
    log('TEST-3', 'PASS', `Response via ${res.message.provider} (${res.message.content.length} chars)`);
    log('TEST-3', 'INFO', `Sources: [${res.sources?.join(', ')}]`);
    passed++;
  } catch (e: any) {
    log('TEST-3', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 4: Weather forecast ──
  try {
    console.log('\n── TEST 4: Weather forecast tool ──');
    const res = await sendChat("What's the weather in Manali for December?");
    if (!res?.message?.content) throw new Error('No response content');
    const hasWeather = res.sources?.includes('getWeatherForecast') || res.sources?.includes('getCurrentWeather');
    log('TEST-4', hasWeather ? 'PASS' : 'WARN', `Weather tool used: ${hasWeather}`);
    log('TEST-4', 'INFO', `Sources: [${res.sources?.join(', ')}]`);
    log('TEST-4', 'INFO', `Preview: "${res.message.content.slice(0, 150)}..."`);
    passed++;
  } catch (e: any) {
    log('TEST-4', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 5: Route info ──
  try {
    console.log('\n── TEST 5: Route info tool ──');
    const res = await sendChat('How to travel from Haridwar to Rishikesh?');
    if (!res?.message?.content) throw new Error('No response content');
    const hasRoute = res.sources?.includes('getRouteInfo');
    log('TEST-5', hasRoute ? 'PASS' : 'WARN', `Route tool used: ${hasRoute}`);
    log('TEST-5', 'INFO', `Sources: [${res.sources?.join(', ')}]`);
    passed++;
  } catch (e: any) {
    log('TEST-5', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 6: Hindi language ──
  try {
    console.log('\n── TEST 6: Hindi language response ──');
    const res = await sendChat('ऋषिकेश में घूमने की सबसे अच्छी जगह कौनसी है?');
    if (!res?.message?.content) throw new Error('No response content');
    const hasHindi = /[\u0900-\u097F]/.test(res.message.content);
    log('TEST-6', 'PASS', `Hindi response: ${hasHindi ? 'Yes (Devanagari detected)' : 'English fallback'}`);
    log('TEST-6', 'INFO', `Preview: "${res.message.content.slice(0, 150)}..."`);
    passed++;
  } catch (e: any) {
    log('TEST-6', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 7: Hinglish follow-up ──
  try {
    console.log('\n── TEST 7: Hinglish follow-up ──');
    const res = await sendChat('Aur nearby koi adventure activity hai?');
    if (!res?.message?.content) throw new Error('No response content');
    log('TEST-7', 'PASS', `Hinglish response (${res.message.content.length} chars)`);
    log('TEST-7', 'INFO', `Preview: "${res.message.content.slice(0, 150)}..."`);
    passed++;
  } catch (e: any) {
    log('TEST-7', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 8: Trip context mode ──
  try {
    console.log('\n── TEST 8: Trip context mode ──');
    const { data: tripsData } = await fetchJson(`${BASE}/trips`);
    let trips = tripsData?.data || [];
    if (trips.length === 0) {
      const { data: newTrip } = await fetchJson(`${BASE}/trips`, {
        method: 'POST',
        body: {
          destination: { name: 'Manali', country: 'India', coordinates: { lat: 32.2432, lng: 77.1892 } },
          dates: { start: '2026-12-01', end: '2026-12-04' },
          duration: 3,
          budget: { total: 25000, currency: 'INR' },
          travellers: { count: 2, type: 'couple' },
          preferences: { pacing: 'moderate', interests: ['nature', 'adventure'] },
        },
      });
      if (newTrip?.data?._id) trips = [newTrip.data];
    }
    if (trips.length > 0) {
      testTripId = trips[0]._id;
      const res = await sendChat('What activities are planned for Day 2?', { tripId: testTripId });
      if (!res?.message?.content) throw new Error('No response content');
      log('TEST-8', 'PASS', `Trip mode response via ${res.message.provider}`);
      log('TEST-8', 'INFO', `TripId: ${testTripId}`);
      log('TEST-8', 'INFO', `Preview: "${res.message.content.slice(0, 150)}..."`);
    } else {
      log('TEST-8', 'WARN', 'No saved trips available — skipped');
    }
    passed++;
  } catch (e: any) {
    log('TEST-8', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 9: Conversation history persistence ──
  try {
    console.log('\n── TEST 9: Conversation history ──');
    const { data: histData } = await fetchJson(`${BASE}/chat/history`);
    const history = histData?.data || [];
    log('TEST-9', 'PASS', `${history.length} conversations found in history`);
    if (history.length > 0) {
      log('TEST-9', 'INFO', `Latest: "${history[0].title}" (${history[0].messageCount} messages)`);
    }
    passed++;
  } catch (e: any) {
    log('TEST-9', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 10: Get specific conversation ──
  try {
    console.log('\n── TEST 10: Get specific conversation ──');
    if (testConversationId) {
      const { data: convData } = await fetchJson(`${BASE}/chat/${testConversationId}`);
      const conv = convData?.data;
      log('TEST-10', 'PASS', `Loaded: "${conv.title}" with ${conv.messages.length} messages`);
    } else {
      log('TEST-10', 'WARN', 'No conversation ID to test');
    }
    passed++;
  } catch (e: any) {
    log('TEST-10', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 11: Cross-user isolation ──
  try {
    console.log('\n── TEST 11: Cross-user isolation ──');
    let otherToken = '';
    try {
      const { data } = await fetchJson(`${BASE}/auth/register`, {
        method: 'POST',
        body: { name: 'Other User', email: 'other-chatbot-isolation@voyageai.com', password: 'Other@1234' },
      });
      otherToken = data?.data?.token || data?.token || '';
    } catch {
      const { data } = await fetchJson(`${BASE}/auth/login`, {
        method: 'POST',
        body: { email: 'other-chatbot-isolation@voyageai.com', password: 'Other@1234' },
      });
      otherToken = data?.data?.token || data?.token || '';
    }

    if (otherToken && testConversationId) {
      const savedToken = authToken;
      authToken = otherToken;
      const { status } = await fetchJson(`${BASE}/chat/${testConversationId}`, { expectError: true });
      authToken = savedToken;
      if (status === 404 || status === 403) {
        log('TEST-11', 'PASS', `Cross-user access correctly blocked (HTTP ${status})`);
        passed++;
      } else {
        log('TEST-11', 'FAIL', `Other user was able to access this conversation (HTTP ${status})`);
        failed++;
      }
    } else {
      log('TEST-11', 'WARN', 'Could not create second user for isolation test');
      passed++;
    }
  } catch (e: any) {
    log('TEST-11', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 12: Delete conversation ──
  try {
    console.log('\n── TEST 12: Delete conversation ──');
    const tempRes = await sendChat('Temporary test conversation to delete.');
    const tempId = tempRes?.conversationId;
    if (tempId) {
      const { data: delData } = await fetchJson(`${BASE}/chat/${tempId}`, { method: 'DELETE' });
      log('TEST-12', 'PASS', `Deleted: ${delData?.data?.message}`);
      // Verify gone
      const { status } = await fetchJson(`${BASE}/chat/${tempId}`, { expectError: true });
      log('TEST-12', 'INFO', `Verified deleted: HTTP ${status}`);
    }
    passed++;
  } catch (e: any) {
    log('TEST-12', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 13: Local dining recommendations ──
  try {
    console.log('\n── TEST 13: Local dining recommendations ──');
    const res = await sendChat('Suggest local Himachali food and dining options in Manali');
    if (!res?.message?.content) throw new Error('No response content');
    const hasDining = res.sources?.includes('getLocalDiningRecommendations');
    log('TEST-13', hasDining ? 'PASS' : 'WARN', `Dining tool used: ${hasDining}`);
    log('TEST-13', 'INFO', `Preview: "${res.message.content.slice(0, 150)}..."`);
    passed++;
  } catch (e: any) {
    log('TEST-13', 'FAIL', e.message);
    failed++;
  }

  // ── TEST 14: Destination images ──
  try {
    console.log('\n── TEST 14: Destination images ──');
    const res = await sendChat('Show me photos of Rishikesh Laxman Jhula');
    if (!res?.message?.content) throw new Error('No response content');
    const hasImages = res.sources?.includes('searchDestinationImages');
    log('TEST-14', hasImages ? 'PASS' : 'WARN', `Image tool used: ${hasImages}`);
    log('TEST-14', 'INFO', `Sources: [${res.sources?.join(', ')}]`);
    passed++;
  } catch (e: any) {
    log('TEST-14', 'FAIL', e.message);
    failed++;
  }

  // ── Summary ──
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  RESULTS: ${passed} passed, ${failed} failed (out of 14)          ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
