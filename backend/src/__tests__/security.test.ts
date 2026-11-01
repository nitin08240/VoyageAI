import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { signToken } from '../utils/token';
import { COOKIE_NAME } from '../config/constants';
import { generateCsrfPair } from '../middleware/csrf.middleware';
import { updateItinerarySchema } from '../modules/itineraries/itineraries.validation';
import { User } from '../models/User.model';

describe('VoyageAI Security Test Suite', () => {
  const validUserId = new mongoose.Types.ObjectId().toString();
  const validUserEmail = 'traveler.test@voyageai.local';

  beforeAll(() => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'findById').mockImplementation((() => ({
      select: jest.fn().mockResolvedValue({ _id: validUserId, tokenVersion: 0 }),
      then: (resolve: any) =>
        resolve({
          id: validUserId,
          _id: validUserId,
          name: 'Test Traveler',
          email: validUserEmail,
          tokenVersion: 0,
        }),
    })) as any);
  });

  // Generate a valid JWT
  const validToken = signToken({
    id: validUserId,
    email: validUserEmail,
  });

  describe('Phase 1: Strict Cookie-Only Authentication', () => {
    it('rejects requests with missing authentication cookie', async () => {
      const res = await request(app).get('/api/v1/trips');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no authentication token provided/i);
    });

    it('rejects requests providing only Authorization Bearer header (no fallback)', async () => {
      const res = await request(app)
        .get('/api/v1/trips')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no authentication token provided/i);
    });

    it('rejects malformed or invalid cookie tokens', async () => {
      const res = await request(app)
        .get('/api/v1/trips')
        .set('Cookie', [`${COOKIE_NAME}=invalid.jwt.signature`]);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('accepts valid cookie-based authentication', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`${COOKIE_NAME}=${validToken}`]);

      // /auth/me returns 200 or user response
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Phase 2: CSRF Protection', () => {
    it('issues a CSRF token and sets _csrf_hmac cookie on GET /api/v1/auth/csrf-token', async () => {
      const res = await request(app).get('/api/v1/auth/csrf-token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.csrfToken).toBeDefined();

      const rawCookies = res.headers['set-cookie'];
      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies || ''];
      const hasHmacCookie = cookies.some((c: string) => c.includes('_csrf_hmac='));
      expect(hasHmacCookie).toBe(true);
    });

    it('allows safe HTTP methods (GET) without CSRF tokens', async () => {
      const res = await request(app).get('/api/v1/health');
      expect([200, 503]).toContain(res.status);
    });

    it('exempts public authentication bootstrap endpoints from CSRF', async () => {
      // POST /api/v1/auth/forgot-password with valid body should pass CSRF check
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'test@voyageai.local' });

      // Passes CSRF (status is not 403)
      expect(res.status).not.toBe(403);
    });

    it('rejects state-changing requests (POST) when CSRF token is missing', async () => {
      const res = await request(app)
        .post('/api/v1/trips')
        .set('Cookie', [`${COOKIE_NAME}=${validToken}`])
        .send({ title: 'Exploit Trip' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/CSRF validation failed/i);
    });

    it('rejects state-changing requests when CSRF token is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/trips')
        .set('Cookie', [
          `${COOKIE_NAME}=${validToken}`,
          '_csrf_hmac=deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        ])
        .set('X-CSRF-Token', 'invalid-token-string')
        .send({ title: 'Exploit Trip' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid token/i);
    });

    it('rejects requests from unauthorized foreign origins (Origin validation)', async () => {
      const { token, hmac } = generateCsrfPair();

      const res = await request(app)
        .post('/api/v1/trips')
        .set('Origin', 'https://attacker-controlled-site.com')
        .set('Cookie', [`${COOKIE_NAME}=${validToken}`, `_csrf_hmac=${hmac}`])
        .set('X-CSRF-Token', token)
        .send({ title: 'Malicious Trip' });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/(forbidden request origin|not allowed by cors)/i);
    });

    it('allows state-changing requests with matching valid CSRF token and cookie', async () => {
      const { token, hmac } = generateCsrfPair();

      const res = await request(app)
        .post('/api/v1/trips')
        .set('Cookie', [`${COOKIE_NAME}=${validToken}`, `_csrf_hmac=${hmac}`])
        .set('X-CSRF-Token', token)
        .send({ title: 'Legitimate Trip' });

      // Should pass CSRF middleware (will fail later on validation/DB, but NOT 403 CSRF)
      expect(res.status).not.toBe(403);
    });
  });

  describe('Phase 5: Structured Zod Itinerary Validation', () => {
    it('accepts valid itinerary update payloads', () => {
      const validPayload = {
        days: [
          {
            dayNumber: 1,
            date: '2026-12-01',
            title: 'Arrival and City Walk',
            morning: [
              {
                name: 'Tokyo Tower Visit',
                duration: '2 hours',
                cost: '$20',
                coordinates: { lat: 35.6586, lng: 139.7454 },
              },
            ],
            afternoon: [],
            evening: [],
            practicalAdvice: 'Wear comfortable walking shoes.',
          },
        ],
        hotels: [
          {
            name: 'Park Hyatt Tokyo',
            location: 'Shinjuku',
            category: 'Luxury',
            priceRange: '$$$$',
            whyRecommended: 'Panoramic skyline views.',
            coordinates: { lat: 35.6852, lng: 139.6911 },
          },
        ],
        safetyTips: ['Keep cash on hand for small vendors.'],
      };

      const result = updateItinerarySchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects unexpected fields (preventing mass assignment)', () => {
      const maliciousPayload = {
        safetyTips: ['Stay safe.'],
        role: 'admin',
        userId: 'attacker-id',
      };

      const result = updateItinerarySchema.safeParse(maliciousPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const unrecognizedError = result.error.errors.find((e) => e.code === 'unrecognized_keys') as any;
        expect(unrecognizedError).toBeDefined();
        expect(unrecognizedError.keys).toEqual(expect.arrayContaining(['role', 'userId']));
      }
    });

    it('rejects out-of-bound geographic coordinates', () => {
      const invalidCoords = {
        days: [
          {
            dayNumber: 1,
            date: '2026-12-01',
            title: 'Invalid GPS Day',
            morning: [
              {
                name: 'Off-planet attraction',
                coordinates: { lat: 999, lng: 999 }, // Invalid latitude > 90
              },
            ],
            afternoon: [],
            evening: [],
          },
        ],
      };

      const result = updateItinerarySchema.safeParse(invalidCoords);
      expect(result.success).toBe(false);
    });
  });

  describe('Phase 6: Infrastructure & Health Monitoring', () => {
    it('reports health readiness and database connection status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('database');
    });

    it('returns structured 404 for nonexistent routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent-route-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/route not found/i);
    });
  });
});

