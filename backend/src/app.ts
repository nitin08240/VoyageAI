import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
import * as tripsController from './modules/trips/trips.controller';

const app: Express = express();

// ─── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Global Rate Limiter ───────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    message: 'VoyageAI API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/trips', tripsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/itineraries', itinerariesRoutes);

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
