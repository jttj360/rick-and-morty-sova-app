import { TestBed } from "@angular/core/testing";
import { DetailsStateService } from "./details-state.service";
import { mockCharacter, mockEpisode } from "@testing/mocks/character.mock";
import { createAppError } from "@core/utils/app-error/app-error";

describe("DetailsStateService", () => {
  let service: DetailsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailsStateService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("initial state", () => {
    it("should have null character", () => {
      expect(service.character()).toBeNull();
    });

    it("should have null episode", () => {
      expect(service.episode()).toBeNull();
    });

    it("should have isLoading as false", () => {
      expect(service.isLoading()).toBe(false);
    });

    it("should have null error", () => {
      expect(service.error()).toBeNull();
    });

    it("should have isOpen as false", () => {
      expect(service.isOpen()).toBe(false);
    });
  });

  describe("setCharacter", () => {
    it("should set character", () => {
      service.setCharacter(mockCharacter);

      expect(service.character()).toEqual(mockCharacter);
    });

    it("should set isOpen to true when character is set", () => {
      service.setCharacter(mockCharacter);

      expect(service.isOpen()).toBe(true);
    });

    it("should clear character with null", () => {
      service.setCharacter(mockCharacter);
      service.setCharacter(null);

      expect(service.character()).toBeNull();
    });
  });

  describe("setEpisode", () => {
    it("should set episode", () => {
      service.setEpisode(mockEpisode);

      expect(service.episode()).toEqual(mockEpisode);
    });

    it("should clear episode with null", () => {
      service.setEpisode(mockEpisode);
      service.setEpisode(null);

      expect(service.episode()).toBeNull();
    });
  });

  describe("setLoading", () => {
    it("should set isLoading to true", () => {
      service.setLoading(true);

      expect(service.isLoading()).toBe(true);
    });

    it("should set isOpen to true when loading", () => {
      service.setLoading(true);

      expect(service.isOpen()).toBe(true);
    });

    it("should set isLoading to false", () => {
      service.setLoading(true);
      service.setLoading(false);

      expect(service.isLoading()).toBe(false);
    });
  });

  describe("setError", () => {
    it("should set error", () => {
      const error = createAppError("network", "Network error");
      service.setError(error);

      expect(service.error()).toEqual(error);
    });

    it("should clear error with null", () => {
      service.setError(createAppError("network", "Network error"));
      service.setError(null);

      expect(service.error()).toBeNull();
    });
  });

  describe("isOpen computed", () => {
    it("should return true when character is set", () => {
      service.setCharacter(mockCharacter);

      expect(service.isOpen()).toBe(true);
    });

    it("should return true when isLoading", () => {
      service.setLoading(true);

      expect(service.isOpen()).toBe(true);
    });

    it("should return false when no character and not loading", () => {
      service.setCharacter(null);
      service.setLoading(false);

      expect(service.isOpen()).toBe(false);
    });
  });

  it("should clear all state on reset", () => {
    service.setCharacter(mockCharacter);
    service.setEpisode(mockEpisode);
    service.setLoading(true);
    service.setError(createAppError("network", "Network error"));

    service.reset();

    expect(service.character()).toBeNull();
    expect(service.episode()).toBeNull();
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeNull();
  });
});
