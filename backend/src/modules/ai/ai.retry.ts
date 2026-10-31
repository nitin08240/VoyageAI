export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  initialDelayMs = 2000
): Promise<T> {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;

      const isHighDemand =
        error?.status === 503 ||
        error?.message?.includes('503') ||
        error?.message?.includes('high demand') ||
        error?.message?.includes('UNAVAILABLE');

      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes('429') ||
        error?.message?.includes('RESOURCE_EXHAUSTED');

      const isTransient =
        error?.status >= 500 ||
        error?.code === 'ECONNRESET' ||
        error?.code === 'ETIMEDOUT' ||
        error?.message?.includes('fetch failed');

      if (attempt >= maxRetries || (!isHighDemand && !isRateLimit && !isTransient)) {
        throw error;
      }

      // Add a slight jitter (0-500ms) to prevent thundering herd
      const jitter = Math.floor(Math.random() * 500);
      const waitTime = delay + jitter;

      if (isHighDemand) {
        console.warn(
          `⏳ [AI Retry] Google Gemini is experiencing temporary high demand (503). Retrying (${attempt}/${maxRetries}) in ${(waitTime / 1000).toFixed(1)}s...`
        );
      } else {
        console.warn(
          `⚠️ [AI Retry] Attempt ${attempt}/${maxRetries} failed (${error?.message || error}). Retrying in ${(waitTime / 1000).toFixed(1)}s...`
        );
      }

      await new Promise((res) => setTimeout(res, waitTime));
      delay = Math.min(delay * 1.8, 15000); // Gradual exponential backoff up to 15s
    }
  }

  throw new Error('Gemini API is currently busy. Please wait a moment and try again.');
}
