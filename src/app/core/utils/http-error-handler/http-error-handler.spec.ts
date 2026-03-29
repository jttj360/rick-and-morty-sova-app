import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import {
  handleHttpError,
  parseRetryAfter,
  getErrorTypeFromStatus,
} from "./http-error-handler";

describe("parseRetryAfter", () => {
  it("should parse seconds string", () => {
    expect(parseRetryAfter("120")).toBe(120);
  });

  it("should parse single digit seconds", () => {
    expect(parseRetryAfter("5")).toBe(5);
  });

  it("should return default for null", () => {
    expect(parseRetryAfter(null)).toBe(10);
  });

  it("should return default for invalid string", () => {
    expect(parseRetryAfter("invalid")).toBe(10);
  });

  it("should parse HTTP date format", () => {
    const futureDate = new Date(Date.now() + 30000).toUTCString();
    const result = parseRetryAfter(futureDate);
    expect(result).toBeGreaterThanOrEqual(29);
    expect(result).toBeLessThanOrEqual(31);
  });
});

describe("getErrorTypeFromStatus", () => {
  it("should return network for status 0", () => {
    expect(getErrorTypeFromStatus(0)).toBe("network");
  });

  it("should return not_found for status 404", () => {
    expect(getErrorTypeFromStatus(404)).toBe("not_found");
  });

  it("should return rate_limit for status 429", () => {
    expect(getErrorTypeFromStatus(429)).toBe("rate_limit");
  });

  it("should return server for status 500+", () => {
    expect(getErrorTypeFromStatus(500)).toBe("server");
    expect(getErrorTypeFromStatus(503)).toBe("server");
  });

  it("should return unknown for other statuses", () => {
    expect(getErrorTypeFromStatus(400)).toBe("unknown");
    expect(getErrorTypeFromStatus(401)).toBe("unknown");
  });
});

describe("handleHttpError", () => {
  it("should create error with provided message", () => {
    const httpError = new HttpErrorResponse({ status: 500 });

    const error = handleHttpError(httpError, "Could not load characters");

    expect(error.message).toBe("Could not load characters");
  });

  it("should return network error for status 0", () => {
    const httpError = new HttpErrorResponse({ status: 0 });

    const error = handleHttpError(httpError, "Network error");

    expect(error.type).toBe("network");
    expect(error.retryable).toBe(true);
  });

  it("should return not_found error for status 404", () => {
    const httpError = new HttpErrorResponse({ status: 404 });

    const error = handleHttpError(httpError, "Character not found");

    expect(error.type).toBe("not_found");
    expect(error.retryable).toBe(false);
  });

  it("should return server error for status 500", () => {
    const httpError = new HttpErrorResponse({ status: 500 });

    const error = handleHttpError(httpError, "Server error");

    expect(error.type).toBe("server");
    expect(error.retryable).toBe(true);
  });

  it("should return unknown error for other status codes", () => {
    const httpError = new HttpErrorResponse({ status: 400 });

    const error = handleHttpError(httpError, "Bad request");

    expect(error.type).toBe("unknown");
  });

  it("should preserve original error", () => {
    const httpError = new HttpErrorResponse({ status: 500 });

    const error = handleHttpError(httpError, "Error");

    expect(error.originalError).toBe(httpError);
  });

  it("should return rate_limit error with retryAfter for status 429", () => {
    const httpError = new HttpErrorResponse({
      status: 429,
      headers: new HttpHeaders({ "Retry-After": "30" }),
    });

    const error = handleHttpError(httpError, "Too many requests");

    expect(error.type).toBe("rate_limit");
    expect(error.retryAfter).toBe(30);
  });

  it("should use default retryAfter when header missing for 429", () => {
    const httpError = new HttpErrorResponse({ status: 429 });

    const error = handleHttpError(httpError, "Rate limited");

    expect(error.retryAfter).toBe(10);
  });

  it("should handle non-HttpErrorResponse errors", () => {
    const genericError = new Error("Something went wrong");

    const error = handleHttpError(genericError, "Operation failed");

    expect(error.type).toBe("unknown");
    expect(error.message).toBe("Operation failed");
    expect(error.originalError).toBe(genericError);
  });

  it("should handle string errors", () => {
    const error = handleHttpError("Network timeout", "Request failed");

    expect(error.type).toBe("unknown");
    expect(error.message).toBe("Request failed");
  });
});
