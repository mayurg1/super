import { ErrorCode, type FieldErrors } from '@supercampus/contracts';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields?: FieldErrors;

  constructor(
    code: ErrorCode,
    message: string,
    options?: { status?: number; fields?: FieldErrors; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'AppError';
    this.code = code;
    this.status = options?.status ?? AppError.defaultStatus(code);
    this.fields = options?.fields;
  }

  static defaultStatus(code: ErrorCode): number {
    switch (code) {
      case ErrorCode.AUTH_REQUIRED:
        return 401;
      case ErrorCode.FORBIDDEN:
        return 403;
      case ErrorCode.NOT_FOUND:
        return 404;
      case ErrorCode.VALIDATION:
        return 422;
      case ErrorCode.RATE_LIMIT:
        return 429;
      case ErrorCode.NETWORK:
        return 0;
      default:
        return 500;
    }
  }

  static fromUnknown(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof Error) {
      return new AppError(ErrorCode.UNKNOWN, error.message, { cause: error });
    }
    return new AppError(ErrorCode.UNKNOWN, 'An unexpected error occurred');
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
