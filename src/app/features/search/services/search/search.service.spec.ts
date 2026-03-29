import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { of, throwError } from "rxjs";
import { SearchService } from "./search.service";
import { SearchStateService } from "../state/search-state.service";
import { RickAndMortyApiService } from "@core/services/rick-and-morty-api/rick-and-morty-api.service";
import {
  mockCharacter,
  mockCharacter2,
  mockCharactersResponse,
} from "@testing/mocks/character.mock";
import { createAppError } from "@core/utils/app-error/app-error";

describe("SearchService", () => {
  let service: SearchService;
  let searchState: SearchStateService;
  let apiMock: jest.Mocked<RickAndMortyApiService>;

  beforeEach(() => {
    apiMock = {
      getCharacters: jest.fn().mockReturnValue(of(mockCharactersResponse)),
    } as unknown as jest.Mocked<RickAndMortyApiService>;

    TestBed.configureTestingModule({
      providers: [
        SearchService,
        SearchStateService,
        { provide: RickAndMortyApiService, useValue: apiMock },
      ],
    });

    service = TestBed.inject(SearchService);
    searchState = TestBed.inject(SearchStateService);
  });

  describe("fetchFirstPageCharacters", () => {
    it("should call API with page 1 and current filters", () => {
      searchState.setFilters({ name: "Rick" });

      service.fetchFirstPageCharacters();

      expect(apiMock.getCharacters).toHaveBeenCalledWith(1, { name: "Rick" });
    });

    it("should set loading state via setSearchStart(true)", () => {
      const spy = jest.spyOn(searchState, "setSearchStart");

      service.fetchFirstPageCharacters();

      expect(spy).toHaveBeenCalledWith(true);
    });

    it("should call setSearchSuccess with response, page 1, and resetList true", () => {
      const spy = jest.spyOn(searchState, "setSearchSuccess");

      service.fetchFirstPageCharacters();

      expect(spy).toHaveBeenCalledWith(mockCharactersResponse, 1, true);
    });

    it("should populate characterList after success", () => {
      service.fetchFirstPageCharacters();

      expect(searchState.characterList()).toEqual(
        mockCharactersResponse.results,
      );
    });

    it("should clear previous errors on new search", () => {
      searchState.setSearchError(createAppError("network", "Network error"));

      service.fetchFirstPageCharacters();

      expect(searchState.error()).toBeNull();
    });

    it("should set hasSearched to true after success", () => {
      service.fetchFirstPageCharacters();

      expect(searchState.hasSearched()).toBe(true);
    });

    it("should update page metadata from response", () => {
      service.fetchFirstPageCharacters();

      expect(searchState.totalPages()).toBe(mockCharactersResponse.info.pages);
      expect(searchState.totalCount()).toBe(mockCharactersResponse.info.count);
      expect(searchState.currentPage()).toBe(1);
    });
  });

  describe("fetchNextPageCharacters", () => {
    beforeEach(() => {
      // simulate a first page already loaded
      searchState.setSearchSuccess(
        {
          info: { count: 100, pages: 5, next: "", prev: "" },
          results: [mockCharacter],
        },
        1,
        true,
      );
    });

    it("should call API with next page number", () => {
      service.fetchNextPageCharacters();

      expect(apiMock.getCharacters).toHaveBeenCalledWith(2, {});
    });

    it("should call setSearchStart with false (append mode)", () => {
      const spy = jest.spyOn(searchState, "setSearchStart");

      service.fetchNextPageCharacters();

      expect(spy).toHaveBeenCalledWith(false);
    });

    it("should call setSearchSuccess with resetList false", () => {
      const spy = jest.spyOn(searchState, "setSearchSuccess");

      service.fetchNextPageCharacters();

      expect(spy).toHaveBeenCalledWith(mockCharactersResponse, 2, false);
    });

    it("should append new characters to existing list", () => {
      service.fetchNextPageCharacters();

      expect(searchState.characterList().length).toBeGreaterThan(1);
      expect(searchState.characterList()[0]).toEqual(mockCharacter);
    });

    it("should not load when already loading", () => {
      searchState.setSearchStart(false);

      service.fetchNextPageCharacters();

      expect(apiMock.getCharacters).not.toHaveBeenCalled();
    });

    it("should not load when no more pages", () => {
      searchState.setSearchSuccess(
        {
          info: { count: 100, pages: 5, next: "", prev: "" },
          results: [mockCharacter],
        },
        5,
        true,
      );

      service.fetchNextPageCharacters();

      expect(apiMock.getCharacters).not.toHaveBeenCalled();
    });
  });

  it("should retry with the last search params (page 1, resetList true)", () => {
    // perform an initial search to set lastSearchParams
    service.fetchFirstPageCharacters();
    apiMock.getCharacters.mockClear();

    service.retryFetchPageCharacters();

    expect(apiMock.getCharacters).toHaveBeenCalledWith(1, {});
  });

  it("should retry with next-page params after a fetchNextPage call", () => {
    searchState.setSearchSuccess(
      {
        info: { count: 100, pages: 5, next: "", prev: "" },
        results: [mockCharacter],
      },
      2,
      true,
    );
    service.fetchNextPageCharacters();
    apiMock.getCharacters.mockClear();

    service.retryFetchPageCharacters();

    expect(apiMock.getCharacters).toHaveBeenCalledWith(3, {});
  });

  it("should set search error on API failure in fetchFirstPageCharacters", () => {
    const httpError = new HttpErrorResponse({ status: 0 });
    apiMock.getCharacters.mockReturnValue(throwError(() => httpError));

    service.fetchFirstPageCharacters();

    expect(searchState.error()).not.toBeNull();
    expect(searchState.error()!.type).toBe("network");
    expect(searchState.isLoading()).toBe(false);
    expect(searchState.hasSearched()).toBe(true);
  });

  it("should set search error on API failure in fetchNextPageCharacters", () => {
    searchState.setSearchSuccess(
      {
        info: { count: 100, pages: 5, next: "", prev: "" },
        results: [mockCharacter],
      },
      1,
      true,
    );
    const httpError = new HttpErrorResponse({ status: 500 });
    apiMock.getCharacters.mockReturnValue(throwError(() => httpError));

    service.fetchNextPageCharacters();

    expect(searchState.error()).not.toBeNull();
    expect(searchState.error()!.type).toBe("server");
  });
});
