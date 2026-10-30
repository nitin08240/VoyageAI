// ─── Base Application Error ───────────────────────────────────────────────────
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintain proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── 400 Validation Error ─────────────────────────────────────────────────────
export class ValidationError extends AppError {
  public readonly errors?: Record<string, string[]>;

  constructor(message = 'Validation failed', errors?: Record<string, string[]>) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// ─── 401 Auth Error ───────────────────────────────────────────────────────────
export class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

// ─── 403 Forbidden Error ──────────────────────────────────────────────────────
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, true, 'FORBIDDEN');
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

// ─── 404 Not Found Error ──────────────────────────────────────────────────────
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// ─── 409 Conflict Error ───────────────────────────────────────────────────────
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, true, 'CONFLICT');
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

// ─── 429 Rate Limit Error ─────────────────────────────────────────────────────
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, true, 'RATE_LIMIT_EXCEEDED');
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

// ─── 503 AI Service Error ─────────────────────────────────────────────────────
export class AIServiceError extends AppError {
  constructor(message = 'AI service is temporarily unavailable. Please try again.') {
    super(message, 503, true, 'AI_SERVICE_ERROR');
    Object.setPrototypeOf(this, AIServiceError.prototype);
  }
}
