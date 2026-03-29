import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { finalize, Observable, switchMap, tap, timer } from "rxjs";
import { parseRetryAfter } from "@core/utils/http-error-handler/http-error-handler";

const DEFAULT_MAX_RETRY_SECONDS = 15;

@Injectable({
  providedIn: "root",
})
export class RateLimitHandlerService {
  isRateLimited(error: unknown): error is HttpErrorResponse {
    return error instanceof HttpErrorResponse && error.status === 429;
  }

  canAutoRetry(
    error: HttpErrorResponse,
    maxSeconds = DEFAULT_MAX_RETRY_SECONDS,
  ): boolean {
    return parseRetryAfter(error.headers.get("Retry-After")) <= maxSeconds;
  }

  waitAndRetry<T>(
    error: HttpErrorResponse,
    retryFn: () => Observable<T>,
    onCountdown?: (remaining: number | null) => void,
  ): Observable<T> {
    const seconds = parseRetryAfter(error.headers.get("Retry-After"));
    const intervalId = this.startCountdown(seconds, onCountdown);

    return timer(seconds * 1000).pipe(
      tap(() => {
        this.clearCountdown(intervalId);
        onCountdown?.(null);
      }),
      switchMap(() => retryFn()),
      finalize(() => this.clearCountdown(intervalId)),
    );
  }

  private startCountdown(
    seconds: number,
    onCountdown?: (remaining: number | null) => void,
  ): ReturnType<typeof setInterval> | undefined {
    if (!onCountdown) return undefined;

    onCountdown(seconds);
    let remaining = seconds;

    return setInterval(() => {
      remaining--;
      if (remaining > 0) {
        onCountdown(remaining);
      }
    }, 1000);
  }

  private clearCountdown(
    intervalId: ReturnType<typeof setInterval> | undefined,
  ): void {
    if (intervalId !== undefined) {
      clearInterval(intervalId);
    }
  }
}
