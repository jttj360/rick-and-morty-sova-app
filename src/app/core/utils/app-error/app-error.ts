import { AppError, AppErrorOptions, ErrorType } from "@core/models/app-error";

const DEFAULT_RETRYABLE: Record<ErrorType, boolean> = {
  network: true,
  not_found: false,
  server: true,
  rate_limit: true,
  unknown: true,
};

export function createAppError(
  type: ErrorType,
  message: string,
  options: AppErrorOptions = {},
): AppError {
  return {
    type,
    message,
    retryable: options.retryable ?? DEFAULT_RETRYABLE[type],
    retryAfter: options.retryAfter,
    originalError: options.originalError,
  };
}
