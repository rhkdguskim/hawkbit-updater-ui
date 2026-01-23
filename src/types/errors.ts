/**
 * Base API Error class
 */
export class ApiError extends Error {
  public readonly status?: number;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    status?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.originalError = originalError;
  }
}

/**
 * HawkBit-specific API error
 */
export class HawkBitError extends ApiError {
  public readonly errorCode?: string;
  public readonly parameters?: string[];

  constructor(
    message: string,
    errorCode?: string,
    status?: number,
    parameters?: string[],
    originalError?: unknown
  ) {
    super(message, status, originalError);
    this.name = 'HawkBitError';
    this.errorCode = errorCode;
    this.parameters = parameters;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed', originalError?: unknown) {
    super(message, 401, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (forbidden)
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Access forbidden', originalError?: unknown) {
    super(message, 403, originalError);
    this.name = 'AuthorizationError';
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends ApiError {
  public readonly resourceType: string;
  public readonly resourceId: string;

  constructor(
    resourceType: string,
    resourceId: string,
    originalError?: unknown
  ) {
    super(`${resourceType} with ID '${resourceId}' not found`, 404, originalError);
    this.name = 'NotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Validation error
 */
export class ValidationError extends ApiError {
  public readonly fields?: Record<string, string[]>;

  constructor(
    message: string,
    fields?: Record<string, string[]>,
    originalError?: unknown
  ) {
    super(message, 400, originalError);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

/**
 * Network error (timeout, connection failed, etc.)
 */
export class NetworkError extends Error {
  public readonly originalError?: unknown;

  constructor(
    message = 'Network request failed',
    originalError?: unknown
  ) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends NetworkError {
  public readonly timeoutMs?: number;

  constructor(
    message = 'Request timeout',
    timeoutMs?: number,
    originalError?: unknown
  ) {
    super(message, originalError);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Error factory to convert unknown errors to typed errors
 */
export class ErrorFactory {
  static fromUnknown(error: unknown): ApiError | NetworkError {
    // If already a typed error, return as is
    if (error instanceof ApiError || error instanceof NetworkError) {
      return error;
    }

    // Handle Axios errors
    if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
      const axiosError = error as any;

      if (axiosError.response) {
        const { status, data } = axiosError.response;

        // Handle HawkBit-specific errors
        if (data && typeof data === 'object' && 'errorCode' in data) {
          return new HawkBitError(
            data.message || 'API request failed',
            data.errorCode,
            status,
            data.parameters,
            error
          );
        }

        // Handle standard HTTP errors
        switch (status) {
          case 401:
            return new AuthenticationError(data?.message, error);
          case 403:
            return new AuthorizationError(data?.message, error);
          case 404:
            return new NotFoundError('Resource', 'unknown', error);
          case 400:
            return new ValidationError(data?.message || 'Validation failed', undefined, error);
          default:
            return new ApiError(
              data?.message || 'API request failed',
              status,
              error
            );
        }
      } else if (axiosError.request) {
        // Network error (no response received)
        if (axiosError.code === 'ECONNABORTED') {
          return new TimeoutError(undefined, undefined, error);
        }
        return new NetworkError('Network request failed', error);
      }
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return new ApiError(error.message, undefined, error);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return new ApiError(error);
    }

    // Fallback for unknown error types
    return new ApiError('An unknown error occurred', undefined, error);
  }
}
