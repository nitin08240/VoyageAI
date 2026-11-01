import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { globalErrorHandler } from './middleware/error.middleware';
import { optionalAuthenticate } from './middleware/auth.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import tripsRoutes from './modules/trips/trips.routes';
import aiRoutes from './modules/ai/ai.routes';
import itinerariesRoutes from './modules/itineraries/itineraries.routes';
import chatRoutes from './modules/chat/chat.routes';
import * as tripsController from './modules/trips/trips.controller';

const app: Express = express();

// ─── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.tile.openstreetmap.org"],
      connectSrc: ["'self'", env.CLIENT_URL],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Only allow localhost/127.0.0.1 in development
    if (env.NODE_ENV !== 'production' && (
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    )) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ─── Global Rate Limiter ───────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? 200 : 503;
  res.status(status).json({
    success: isDbConnected,
    message: isDbConnected ? 'VoyageAI API is healthy and connected to database' : 'Database connection unavailable',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: isDbConnected ? 'connected' : 'disconnected',
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/trips', tripsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/itineraries', itinerariesRoutes);
app.use('/api/v1/chat', chatRoutes);

// ─── Public Shared Trip ────────────────────────────────────────────────────────
app.get('/api/v1/shared/:token', optionalAuthenticate, tripsController.getSharedTrip as any);

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Error Handler (must be last) ───────────────────────────────────────
app.use(globalErrorHandler);

export default app;
