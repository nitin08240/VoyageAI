import { z } from 'zod';

const envSchema = z.object({
  // Required
  PORT: z.string().min(1).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().min(1, 'GEMINI_MODEL is required').default('gemini-3.8-flash'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),

  // Optional
  COOKIE_DOMAIN: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  RESET_TOKEN_EXPIRY_MS: z.string().optional(),
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  // Normalize alternate environment key names
  if (!process.env.UNSPLASH_ACCESS_KEY && process.env.ACCESS_KEY) {
    process.env.UNSPLASH_ACCESS_KEY = process.env.ACCESS_KEY;
  }
  if (!process.env.OPENWEATHER_API_KEY && (process.env as any).OpenWeather) {
    process.env.OPENWEATHER_API_KEY = (process.env as any).OpenWeather;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    parsed.error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();
