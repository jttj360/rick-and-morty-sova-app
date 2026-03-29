import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { of, Subscription } from "rxjs";
import { RateLimitHandlerService } from "./rate-limit-handler.service";

describe("RateLimitHandlerService", () => {
  let service: RateLimitHandlerService;

  beforeEach(() => {
    jest.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [RateLimitHandlerService],
    });

    service = TestBed.inject(RateLimitHandlerService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should identify 429 errors as rate limited", () => {
    expect(service.isRateLimited(new HttpErrorResponse({ status: 429 }))).toBe(
      true,
    );
  });

  it("should not identify non-429 errors as rate limited", () => {
    expect(service.isRateLimited(new HttpErrorResponse({ status: 500 }))).toBe(
      false,
    );
    expect(service.isRateLimited(new Error("generic"))).toBe(false);
    expect(service.isRateLimited(null)).toBe(false);
  });

  it("should allow auto retry when retry-after is within threshold", () => {
    const error = new HttpErrorResponse({
      status: 429,
      headers: new HttpHeaders({ "Retry-After": "5" }),
    });

    expect(service.canAutoRetry(error, 15)).toBe(true);
  });

  it("should reject auto retry when retry-after exceeds threshold", () => {
    const error = new HttpErrorResponse({
      status: 429,
      headers: new HttpHeaders({ "Retry-After": "16" }),
    });

    // default max is 15 seconds
    expect(service.canAutoRetry(error)).toBe(false);
  });

  it("should call retryFn after the retry-after delay", () => {
    const error = new HttpErrorResponse({
      status: 429,
      headers: new HttpHeaders({ "Retry-After": "2" }),
    });
    const retryFn = jest.fn().mockReturnValue(of("retried"));
    let result: string | undefined;

    service.waitAndRetry(error, retryFn).subscribe((val) => (result = val));
    expect(retryFn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2000);

    expect(retryFn).toHaveBeenCalled();
    expect(result).toBe("retried");
  });

  it("should tick countdown every second and signal null on completion", () => {
    const error = new HttpErrorResponse({
      status: 429,
      headers: new HttpHeaders({ "Retry-After": "3" }),
    });
    const onCountdown = jest.fn();

    service.waitAndRetry(error, () => of("ok"), onCountdown).subscribe();

    expect(onCountdown).toHaveBeenCalledWith(3);

    jest.advanceTimersByTime(1000);
    expect(onCountdown).toHaveBeenCalledWith(2);

    jest.advanceTimersByTime(1000);
    expect(onCountdown).toHaveBeenCalledWith(1);

    jest.advanceTimersByTime(1000);
    expect(onCountdown).toHaveBeenCalledWith(null);
  });

  it("should clean up interval on unsubscribe", () => {
    const error = new HttpErrorResponse({
      status: 429,
      headers: new HttpHeaders({ "Retry-After": "10" }),
    });
    const onCountdown = jest.fn();

    const sub: Subscription = service
      .waitAndRetry(error, () => of("ok"), onCountdown)
      .subscribe();

    jest.advanceTimersByTime(1000);
    sub.unsubscribe();
    jest.advanceTimersByTime(5000);

    // only initial(10) + one tick(9), no more after unsubscribe
    expect(onCountdown).toHaveBeenCalledTimes(2);
  });

  it("should work without onCountdown callback", () => {
    const error = new HttpErrorResponse({
      status: 429,
      headers: new HttpHeaders({ "Retry-After": "1" }),
    });
    let result: string | undefined;

    service
      .waitAndRetry(error, () => of("ok"))
      .subscribe((val) => (result = val));
    jest.advanceTimersByTime(1000);

    expect(result).toBe("ok");
  });
});
