import { createAppError } from "./app-error";
import { AppError } from "@core/models/app-error";

describe("AppError", () => {
  describe("createAppError", () => {
    it("should create error with type and message", () => {
      const error = createAppError("network", "Connection failed");

      expect(error.type).toBe("network");
      expect(error.message).toBe("Connection failed");
    });

    it("should use default retryable based on type", () => {
      expect(createAppError("network", "msg").retryable).toBe(true);
      expect(createAppError("not_found", "msg").retryable).toBe(false);
      expect(createAppError("server", "msg").retryable).toBe(true);
      expect(createAppError("rate_limit", "msg").retryable).toBe(true);
      expect(createAppError("unknown", "msg").retryable).toBe(true);
    });

    it("should allow overriding retryable", () => {
      const error = createAppError("network", "msg", { retryable: false });

      expect(error.retryable).toBe(false);
    });

    it("should include retryAfter when provided", () => {
      const error = createAppError("rate_limit", "Too many requests", {
        retryAfter: 30,
      });

      expect(error.retryAfter).toBe(30);
    });

    it("should include original error when provided", () => {
      const originalError = new Error("Original");
      const error = createAppError("server", "Server error", { originalError });

      expect(error.originalError).toBe(originalError);
    });
  });
});
