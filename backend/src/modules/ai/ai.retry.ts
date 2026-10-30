export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1500
): Promise<T> {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      // Don't retry on non-retryable errors (e.g. invalid client inputs or schema validation failure that won't change)
      const isRateLimit = error?.status === 429 || error?.message?.includes('429');
      const isTransient =
        error?.status >= 500 ||
        error?.code === 'ECONNRESET' ||
        error?.code === 'ETIMEDOUT' ||
        error?.message?.includes('fetch failed');

      if (attempt >= maxRetries || (!isRateLimit && !isTransient)) {
        throw error;
      }

      console.warn(`[AI Retry] Attempt ${attempt}/${maxRetries} failed: ${error?.message || error}. Retrying in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw new Error('Max retries exceeded');
}
