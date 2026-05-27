/**
 * Global error reducer — khrings/Appdev src/app/reducers/error.ts
 */
export interface ErrorPayload {
  error?: unknown;
  statusCode?: number;
  message?: string;
  userMessage?: string;
  fieldErrors?: Record<string, unknown>;
  isRetryable?: boolean;
  timestamp?: string;
  actionType?: string;
  details?: unknown;
}

export interface ErrorState {
  error: unknown;
  statusCode: number | null;
  message: string | null;
  userMessage: string | null;
  fieldErrors: Record<string, unknown>;
  isRetryable: boolean;
  timestamp: string | null;
  actionType: string | null;
  details: unknown;
}

export type ErrorAction = {
  type: string;
  payload?: ErrorPayload | null;
  [extraProp: string]: unknown;
};

const initialState: ErrorState = {
  error: null,
  statusCode: null,
  message: null,
  userMessage: null,
  fieldErrors: {},
  isRetryable: false,
  timestamp: null,
  actionType: null,
  details: null,
};

export default function errorReducer(
  state: ErrorState = initialState,
  action: ErrorAction,
): ErrorState {
  switch (action.type) {
    case 'SET_ERROR':
      if (!action.payload) {
        return initialState;
      }
      return {
        ...state,
        error: action.payload,
        statusCode: action.payload.statusCode ?? null,
        message: action.payload.message ?? action.payload.userMessage ?? null,
        userMessage: action.payload.userMessage ?? action.payload.message ?? null,
        fieldErrors: action.payload.fieldErrors ?? {},
        isRetryable: action.payload.isRetryable ?? false,
        timestamp: action.payload.timestamp ?? new Date().toISOString(),
        actionType: action.payload.actionType ?? null,
        details: action.payload.details ?? null,
      };

    case 'CLEAR_ERROR':
      return initialState;

    case 'UNAUTHORIZED_ERROR':
      return {
        ...initialState,
        statusCode: 401,
        message: 'Session expired. Please sign in again.',
        userMessage: 'Your session has expired. Please sign in again.',
        isRetryable: false,
        timestamp: new Date().toISOString(),
      };

    case 'NETWORK_ERROR':
      return {
        ...initialState,
        statusCode: 0,
        message: action.payload?.message ?? 'Network error.',
        userMessage:
          action.payload?.userMessage ?? 'Check npm run server and npm run sync:pc-ip',
        isRetryable: true,
        timestamp: new Date().toISOString(),
      };

    case 'VALIDATION_ERROR':
      return {
        ...initialState,
        statusCode: 422,
        message: 'Validation failed.',
        userMessage: 'Please check your input and try again.',
        fieldErrors: action.payload?.fieldErrors ?? {},
        isRetryable: false,
        timestamp: new Date().toISOString(),
      };

    default:
      return state;
  }
}

export const setError = (payload: ErrorPayload | null) => ({
  type: 'SET_ERROR',
  payload,
});

export const clearError = () => ({
  type: 'CLEAR_ERROR',
});

export const setValidationError = (fieldErrors: Record<string, unknown>) => ({
  type: 'VALIDATION_ERROR',
  payload: { fieldErrors },
});
