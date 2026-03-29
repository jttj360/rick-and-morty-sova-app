export type ErrorType =
  | "network"
  | "not_found"
  | "server"
  | "rate_limit"
  | "unknown";

export interface AppError {
  type: ErrorType;
  message: string;
  retryable: boolean;
  retryAfter?: number;
  originalError?: unknown;
}

export interface AppErrorOptions {
  retryable?: boolean;
  retryAfter?: number;
  originalError?: unknown;
}
