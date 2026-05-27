/**
 * Error utilities — khrings/Appdev src/utils/errorUtils.ts (+ CasaClick helpers)
 */
import { formatFetchError } from '../app/api/networkErrors';
import { isSessionExpiredError } from '../app/api/sessionExpired';
import type { ErrorPayload } from '../app/reducers/error';

export interface ParsedError {
  userMessage: string;
  fieldErrors: Record<string, string | string[]>;
  technicalError?: string;
  statusCode: number;
}

export const parseAPIError = (response: unknown, statusCode: number): ParsedError => {
  const data = (response as { data?: Record<string, unknown> })?.data;
  let userMessage = 'An error occurred. Please try again.';
  let fieldErrors: Record<string, string | string[]> = {};

  switch (statusCode) {
    case 401:
      userMessage = 'Your session has expired. Please sign in again.';
      break;
    case 403:
      userMessage = 'You do not have permission to perform this action.';
      break;
    case 422:
      userMessage = 'Validation failed. Please check your input.';
      fieldErrors = formatValidationErrors(data?.errors);
      break;
    case 0:
      userMessage = 'Cannot reach the server. Run npm run server and npm run sync:pc-ip.';
      break;
    default:
      userMessage =
        (typeof data?.message === 'string' && data.message) ||
        (typeof data?.error === 'string' && data.error) ||
        userMessage;
  }

  return { userMessage, fieldErrors, statusCode };
};

const formatValidationErrors = (errors: unknown): Record<string, string | string[]> => {
  if (!errors || typeof errors !== 'object') {
    return {};
  }
  const formatted: Record<string, string | string[]> = {};
  for (const [field, messages] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(messages)) {
      formatted[field] = messages.length === 1 ? String(messages[0]) : messages.map(String);
    } else if (typeof messages === 'string') {
      formatted[field] = messages;
    } else {
      formatted[field] = 'Invalid input';
    }
  }
  return formatted;
};

export const formatErrorForRedux = (error: unknown, statusCode: number | null = 0): ErrorPayload => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Request failed';

  const code =
    statusCode ??
    (message.toLowerCase().includes('session') ? 401 : 0);

  return {
    statusCode: code,
    message,
    userMessage: message,
    isRetryable: code === 0 || code >= 500,
    timestamp: new Date().toISOString(),
  };
};

export function getDisplayError(error: unknown, fallback = 'Something went wrong'): string {
  if (isSessionExpiredError(error)) {
    return 'Your session expired. Please sign in again.';
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return formatFetchError(error, fallback);
}

export function isNetworkError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('network request failed') ||
    m.includes('cannot reach') ||
    m.includes('timeout') ||
    m.includes('failed to fetch')
  );
}
