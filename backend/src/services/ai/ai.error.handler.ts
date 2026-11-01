export enum AIErrorKind {
  QUOTA_EXHAUSTED = 'QUOTA_EXHAUSTED',
  RATE_LIMITED = 'RATE_LIMITED',
  TRANSIENT_SERVICE_ERROR = 'TRANSIENT_SERVICE_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  INVALID_MODEL = 'INVALID_MODEL',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export class AIProviderError extends Error {
  public readonly kind: AIErrorKind;
  public readonly provider: string;
  public readonly statusCode?: number;
  public readonly isFallbackEligible: boolean;

  constructor(
    message: string,
    kind: AIErrorKind,
    provider: string,
    statusCode?: number,
    isFallbackEligible: boolean = false
  ) {
    super(message);
    this.name = 'AIProviderError';
    this.kind = kind;
    this.provider = provider;
    this.statusCode = statusCode;
    this.isFallbackEligible = isFallbackEligible;
  }
}

export function classifyAIError(err: any, provider: 'gemini' | 'groq'): AIProviderError {
  const msg = (err?.message || String(err)).toLowerCase();
  const status = err?.status || err?.statusCode || (typeof err?.code === 'number' ? err.code : undefined);

  // 1. Quota Exhaustion
  if (
    status === 429 &&
    (msg.includes('quota') ||
      msg.includes('resource_exhausted') ||
      msg.includes('exceeded your current quota') ||
      msg.includes('daily limit') ||
      msg.includes('insufficient_quota'))
  ) {
    return new AIProviderError(
      `${provider.toUpperCase()} daily free quota exhausted. Switching to fallback provider.`,
      AIErrorKind.QUOTA_EXHAUSTED,
      provider,
      429,
      true // fallback eligible
    );
  }

  // 2. Rate Limit (RPM / TPM)
  if (status === 429 || msg.includes('rate limit') || msg.includes('too many requests')) {
    return new AIProviderError(
      `${provider.toUpperCase()} rate limit reached.`,
      AIErrorKind.RATE_LIMITED,
      provider,
      429,
      true // fallback eligible if retries exhausted
    );
  }

  // 3. Authentication & API Key Errors (Do NOT fallback, report configuration)
  if (
    status === 401 ||
    status === 403 ||
    msg.includes('api key not valid') ||
    msg.includes('unauthorized') ||
    msg.includes('invalid_api_key') ||
    msg.includes('permission denied')
  ) {
    return new AIProviderError(
      `Invalid or unauthorized API key for ${provider.toUpperCase()}. Please check backend configuration.`,
      AIErrorKind.AUTH_ERROR,
      provider,
      status || 401,
      false // NOT fallback eligible
    );
  }

  // 4. Invalid Model ID (Do NOT fallback, report configuration)
  if (
    status === 404 ||
    msg.includes('model not found') ||
    msg.includes('does not exist') ||
    msg.includes('unrecognized model')
  ) {
    return new AIProviderError(
      `Configured model is invalid or unavailable for ${provider.toUpperCase()}.`,
      AIErrorKind.INVALID_MODEL,
      provider,
      status || 404,
      false // NOT fallback eligible
    );
  }

  // 5. Transient Server Errors (500, 502, 503, 504)
  if (
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    msg.includes('overloaded') ||
    msg.includes('service unavailable') ||
    msg.includes('internal error')
  ) {
    return new AIProviderError(
      `${provider.toUpperCase()} temporarily unavailable (${status || 503}).`,
      AIErrorKind.TRANSIENT_SERVICE_ERROR,
      provider,
      status || 503,
      true // fallback eligible
    );
  }

  // 6. Network / Abort Errors
  if (
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('enotfound') ||
    msg.includes('aborted') ||
    msg.includes('fetch failed')
  ) {
    return new AIProviderError(
      `Network connection to ${provider.toUpperCase()} failed or timed out.`,
      AIErrorKind.NETWORK_ERROR,
      provider,
      undefined,
      true // fallback eligible
    );
  }

  // 7. Generic / Unknown or Tool Calling Protocol Error
  // If the primary provider fails due to any protocol or unexpected issue, allow fallback
  return new AIProviderError(
    `${provider.toUpperCase()} error: ${err?.message || 'Unknown error'}`,
    AIErrorKind.UNKNOWN,
    provider,
    status,
    true // Fallback eligible so secondary provider can take over
  );
}

