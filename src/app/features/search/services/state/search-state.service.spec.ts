import { TestBed } from "@angular/core/testing";
import { SearchStateService } from "./search-state.service";
import { mockCharacter, mockCharacter2 } from "@testing/mocks/character.mock";
import { createAppError } from "@core/utils/app-error/app-error";
import { Character } from "@core/models/rick-and-morty";

const createResponse = (
  pages: number,
  results: Character[] = [mockCharacter],
) => ({
  info: { count: results.length, pages, next: "", prev: "" },
  results,
});

describe("SearchStateService", () => {
  let service: SearchStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchStateService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("initial state", () => {
    it("should have empty characters", () => {
      expect(service.characterList()).toEqual([]);
    });

    it("should have totalPages as 0", () => {
      expect(service.totalPages()).toBe(0);
    });

    it("should have totalCount as 0", () => {
      expect(service.totalCount()).toBe(0);
    });

    it("should have isLoading as false", () => {
      expect(service.isLoading()).toBe(false);
    });

    it("should have currentPage as 0", () => {
      expect(service.currentPage()).toBe(0);
    });

    it("should have empty filters", () => {
      expect(service.filters()).toEqual({});
    });

    it("should have null error", () => {
      expect(service.error()).toBeNull();
    });

    it("should have hasSearched as false", () => {
      expect(service.hasSearched()).toBe(false);
    });

    it("should have null retryCountdown", () => {
      expect(service.retryCountdown()).toBeNull();
    });
  });

  it("should update filters via setFilters", () => {
    const filters = { name: "Rick", status: "Alive" };

    service.setFilters(filters);

    expect(service.filters()).toEqual(filters);
  });

  it("should update retryCountdown via setRetryCountdown", () => {
    service.setRetryCountdown(5);

    expect(service.retryCountdown()).toBe(5);
  });

  describe("hasMore computed", () => {
    it("should return true when currentPage < totalPages", () => {
      service.setSearchSuccess(createResponse(5), 1, true);

      expect(service.hasMore()).toBe(true);
    });

    it("should return false when currentPage equals totalPages", () => {
      service.setSearchSuccess(createResponse(5), 5, true);

      expect(service.hasMore()).toBe(false);
    });

    it("should return false when both are 0", () => {
      expect(service.hasMore()).toBe(false);
    });
  });

  describe("isEmpty computed", () => {
    it("should return true when search returns no results", () => {
      service.setSearchSuccess(createResponse(0, []), 1, true);

      expect(service.isEmpty()).toBe(true);
    });

    it("should return false when has characters", () => {
      service.setSearchSuccess(createResponse(1), 1, true);

      expect(service.isEmpty()).toBe(false);
    });

    it("should return false when has not searched", () => {
      expect(service.isEmpty()).toBe(false);
    });

    it("should return false when loading", () => {
      service.setSearchStart(true);

      expect(service.isEmpty()).toBe(false);
    });
  });

  describe("state computed", () => {
    it("should return loading status when isLoading", () => {
      service.setSearchStart(true);

      expect(service.state().status).toBe("loading");
    });

    it("should return empty status when search has no results", () => {
      service.setSearchSuccess(createResponse(0, []), 1, true);

      expect(service.state().status).toBe("empty");
    });

    it("should return empty status after not_found error", () => {
      service.setSearchError(
        createAppError("not_found", "Character not found"),
      );

      expect(service.state().status).toBe("empty");
    });

    it("should return success status when has characters", () => {
      service.setSearchSuccess(createResponse(1), 1, true);

      expect(service.state().status).toBe("success");
    });

    it("should return loading status by default", () => {
      expect(service.state().status).toBe("loading");
    });
  });

  it("should clear all state on reset", () => {
    service.setFilters({ name: "test" });
    service.setSearchSuccess(createResponse(1), 1, true);
    service.setSearchError(createAppError("network", "Network error"));

    service.reset();

    expect(service.characterList()).toEqual([]);
    expect(service.filters()).toEqual({});
    expect(service.error()).toBeNull();
    expect(service.hasSearched()).toBe(false);
  });

  describe("setSearchStart", () => {
    it("should set loading to true", () => {
      service.setSearchStart(false);

      expect(service.isLoading()).toBe(true);
    });

    it("should reset state when resetList is true", () => {
      service.setSearchSuccess(createResponse(5), 1, true);
      service.setRetryCountdown(10);

      service.setSearchStart(true);

      expect(service.characterList()).toEqual([]);
      expect(service.error()).toBeNull();
      expect(service.totalPages()).toBe(0);
      expect(service.totalCount()).toBe(0);
      expect(service.retryCountdown()).toBeNull();
    });

    it("should preserve state when resetList is false", () => {
      service.setSearchSuccess(createResponse(5), 1, true);

      service.setSearchStart(false);

      expect(service.characterList()).toEqual([mockCharacter]);
      expect(service.totalPages()).toBe(5);
    });
  });

  describe("setSearchSuccess", () => {
    const mockResponse = createResponse(5, [mockCharacter, mockCharacter2]);

    it("should set characters and pagination info", () => {
      service.setSearchSuccess(mockResponse, 1, true);

      expect(service.characterList()).toEqual([mockCharacter, mockCharacter2]);
      expect(service.totalPages()).toBe(5);
      expect(service.totalCount()).toBe(2);
      expect(service.currentPage()).toBe(1);
      expect(service.isLoading()).toBe(false);
      expect(service.hasSearched()).toBe(true);
    });

    it("should clear error and retryCountdown", () => {
      service.setSearchError(createAppError("network", "Network error"));
      service.setRetryCountdown(10);

      service.setSearchSuccess(mockResponse, 1, true);

      expect(service.error()).toBeNull();
      expect(service.retryCountdown()).toBeNull();
    });

    it("should replace characters when resetList is true", () => {
      service.setSearchSuccess(createResponse(1), 1, true);

      service.setSearchSuccess(mockResponse, 1, true);

      expect(service.characterList()).toEqual([mockCharacter, mockCharacter2]);
    });

    it("should append characters when resetList is false", () => {
      service.setSearchSuccess(createResponse(5), 1, true);

      service.setSearchSuccess(createResponse(5, [mockCharacter2]), 2, false);

      expect(service.characterList()).toEqual([mockCharacter, mockCharacter2]);
    });
  });

  it("should set error and update loading state on setSearchError", () => {
    service.setSearchStart(true);
    const error = createAppError("network", "Network error");

    service.setSearchError(error);

    expect(service.error()).toEqual(error);
    expect(service.isLoading()).toBe(false);
    expect(service.hasSearched()).toBe(true);
  });
});
