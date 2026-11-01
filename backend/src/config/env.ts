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

  // Chat & AI Provider Configuration
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  AI_PRIMARY_PROVIDER: z.enum(['gemini', 'groq']).default('gemini'),
  AI_FALLBACK_PROVIDER: z.enum(['gemini', 'groq']).default('groq'),
  CHAT_MAX_HISTORY_MESSAGES: z.coerce.number().default(20),
  CHAT_RATE_LIMIT: z.coerce.number().default(20),
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

  // Block insecure default secrets in production
  if (parsed.data.NODE_ENV === 'production' && parsed.data.JWT_SECRET.includes('voyageai_super_secret')) {
    console.error('❌ FATAL: Default JWT_SECRET from .env.example cannot be used in production!');
    console.error('   Generate a secure secret: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();
