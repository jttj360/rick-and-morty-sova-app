import { HttpErrorResponse } from "@angular/common/http";
import { AppError, ErrorType } from "@core/models/app-error";
import { createAppError } from "../app-error/app-error";

export function parseRetryAfter(retryAfter: string | null): number {
  if (!retryAfter) {
    return 10;
  }

  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds;
  }

  const date = Date.parse(retryAfter);
  if (!isNaN(date)) {
    const delayMs = date - Date.now();
    return Math.max(1, Math.ceil(delayMs / 1000));
  }

  return 10;
}

export function getErrorTypeFromStatus(status: number): ErrorType {
  if (status === 0) return "network";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "server";
  return "unknown";
}

export function handleHttpError(error: unknown, message: string): AppError {
  if (error instanceof HttpErrorResponse) {
    const type = getErrorTypeFromStatus(error.status);
    const retryAfter =
      type === "rate_limit"
        ? parseRetryAfter(error.headers.get("Retry-After"))
        : undefined;

    return createAppError(type, message, { retryAfter, originalError: error });
  }

  return createAppError("unknown", message, { originalError: error });
}
