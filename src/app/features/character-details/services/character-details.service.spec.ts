import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { of, throwError } from "rxjs";
import { CharacterDetailsService } from "./character-details.service";
import { DetailsStateService } from "@features/search/components/card-details/state/details-state.service";
import { RickAndMortyApiService } from "@core/services/rick-and-morty-api/rick-and-morty-api.service";
import {
  mockCharacter,
  mockCharacter2,
  mockEpisode,
} from "@testing/mocks/character.mock";

describe("CharacterDetailsService", () => {
  let service: CharacterDetailsService;
  let detailsState: DetailsStateService;
  let apiMock: jest.Mocked<RickAndMortyApiService>;

  beforeEach(() => {
    apiMock = {
      getCharacterById: jest.fn().mockReturnValue(of(mockCharacter)),
      getEpisodeById: jest.fn().mockReturnValue(of(mockEpisode)),
    } as unknown as jest.Mocked<RickAndMortyApiService>;

    TestBed.configureTestingModule({
      providers: [
        CharacterDetailsService,
        DetailsStateService,
        { provide: RickAndMortyApiService, useValue: apiMock },
      ],
    });

    service = TestBed.inject(CharacterDetailsService);
    detailsState = TestBed.inject(DetailsStateService);
  });

  describe("openCharacterDetails", () => {
    it("should use cached character when found", () => {
      service.openCharacterDetails(mockCharacter.id, [
        mockCharacter,
        mockCharacter2,
      ]);

      expect(apiMock.getCharacterById).not.toHaveBeenCalled();
      expect(detailsState.character()).toEqual(mockCharacter);
    });

    it("should set loading false and error null when using cache", () => {
      service.openCharacterDetails(mockCharacter.id, [mockCharacter]);

      expect(detailsState.isLoading()).toBe(false);
      expect(detailsState.error()).toBeNull();
    });

    it("should fetch last episode for cached character", () => {
      service.openCharacterDetails(mockCharacter.id, [mockCharacter]);

      expect(apiMock.getEpisodeById).toHaveBeenCalledWith(2);
      expect(detailsState.episode()).toEqual(mockEpisode);
    });

    it("should call API when character is NOT in cache", () => {
      service.openCharacterDetails(mockCharacter.id, []);

      expect(apiMock.getCharacterById).toHaveBeenCalledWith(mockCharacter.id);
    });

    it("should set character and episode from API when not cached", () => {
      service.openCharacterDetails(mockCharacter.id, []);

      expect(detailsState.character()).toEqual(mockCharacter);
      expect(detailsState.episode()).toEqual(mockEpisode);
      expect(detailsState.isLoading()).toBe(false);
    });

    it("should set loading true and clear state before API call", () => {
      const setLoadingSpy = jest.spyOn(detailsState, "setLoading");
      const setCharSpy = jest.spyOn(detailsState, "setCharacter");
      const setEpSpy = jest.spyOn(detailsState, "setEpisode");
      const setErrSpy = jest.spyOn(detailsState, "setError");

      service.openCharacterDetails(mockCharacter.id, []);

      expect(setLoadingSpy).toHaveBeenCalledWith(true);
      expect(setCharSpy).toHaveBeenCalledWith(null);
      expect(setEpSpy).toHaveBeenCalledWith(null);
      expect(setErrSpy).toHaveBeenCalledWith(null);
    });
  });

  it("should retry fetching the last opened character", () => {
    service.openCharacterDetails(mockCharacter.id, []);
    apiMock.getCharacterById.mockClear();
    apiMock.getEpisodeById.mockClear();

    service.retryFetchCharacterDetails();

    expect(apiMock.getCharacterById).toHaveBeenCalledWith(mockCharacter.id);
  });

  it("should do nothing on retry if no character was previously opened", () => {
    service.retryFetchCharacterDetails();

    expect(apiMock.getCharacterById).not.toHaveBeenCalled();
  });

  it("should set details error on API failure", () => {
    const httpError = new HttpErrorResponse({ status: 404 });
    apiMock.getCharacterById.mockReturnValue(throwError(() => httpError));

    service.openCharacterDetails(999, []);

    expect(detailsState.error()).not.toBeNull();
    expect(detailsState.error()!.type).toBe("not_found");
    expect(detailsState.character()).toBeNull();
    expect(detailsState.isLoading()).toBe(false);
  });

  it("should handle episode fetch failure gracefully", () => {
    apiMock.getEpisodeById.mockReturnValue(throwError(() => new Error("fail")));

    service.openCharacterDetails(mockCharacter.id, [mockCharacter]);

    expect(detailsState.character()).toEqual(mockCharacter);
    expect(detailsState.episode()).toBeNull();
  });
});
