import { AxiosError } from 'axios';

/**
 * Type guard to check if error is an AxiosError
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
};

/**
 * Type guard to check if error is a standard Error
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Type guard to check if error has a response
 */
export const hasErrorResponse = (
  error: unknown
): error is AxiosError & { response: NonNullable<AxiosError['response']> } => {
  return isAxiosError(error) && error.response !== undefined;
};

/**
 * Type guard to check if error response has data
 */
export const hasErrorData = <T = unknown>(
  error: unknown
): error is AxiosError & {
  response: { data: T; status: number; statusText: string };
} => {
  return hasErrorResponse(error) && error.response.data !== undefined;
};

/**
 * HawkBit API error response structure
 */
export interface HawkBitErrorData {
  errorCode?: string;
  message?: string;
  exceptionClass?: string;
  parameters?: string[];
}

/**
 * Type guard to check if error data is HawkBit error format
 */
export const isHawkBitError = (
  error: unknown
): error is AxiosError<HawkBitErrorData> => {
  if (!hasErrorData(error)) {
    return false;
  }

  const data = error.response.data;
  return (
    typeof data === 'object' &&
    data !== null &&
    ('errorCode' in data || 'message' in data)
  );
};

/**
 * Safely extract error message from unknown error
 */
export const getErrorMessage = (error: unknown, fallback = 'Unknown error'): string => {
  if (isHawkBitError(error)) {
    return error.response?.data.message || fallback;
  }

  if (isAxiosError(error)) {
    return error.message || fallback;
  }

  if (isError(error)) {
    return error.message || fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
};

/**
 * Safely extract error code from HawkBit error
 */
export const getErrorCode = (error: unknown): string | undefined => {
  if (isHawkBitError(error)) {
    return error.response?.data.errorCode;
  }
  return undefined;
};

/**
 * Safely extract HTTP status code from error
 */
export const getStatusCode = (error: unknown): number | undefined => {
  if (hasErrorResponse(error)) {
    return error.response?.status;
  }
  return undefined;
};
