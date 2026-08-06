export enum ErrorCode {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

export interface FieldErrors {
  [field: string]: string;
}

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
  fields?: FieldErrors;
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorBody;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as ApiErrorEnvelope).success === false
  );
}
