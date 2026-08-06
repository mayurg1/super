import type { Logger } from '../logging/logger.js';
import { AppError, getErrorMessage } from './appError.js';
import { ErrorCode } from '@supercampus/contracts';

export interface ErrorHandlerOptions {
  logger: Logger;
  onNotify?: (message: string) => void;
}

export function handleError(error: unknown, options: ErrorHandlerOptions): AppError {
  const appError = AppError.fromUnknown(error);
  options.logger.error(appError.message, {
    code: appError.code,
    status: appError.status,
    fields: appError.fields,
  });

  if (appError.code === ErrorCode.NETWORK && options.onNotify) {
    options.onNotify('Network error — please check your connection.');
  }

  return appError;
}

export function toUserMessage(error: unknown): string {
  const appError = AppError.fromUnknown(error);
  if (appError.code === ErrorCode.AUTH_REQUIRED) {
    return 'Please sign in to continue.';
  }
  if (appError.code === ErrorCode.FORBIDDEN) {
    return 'You do not have permission to do that.';
  }
  return getErrorMessage(appError);
}
