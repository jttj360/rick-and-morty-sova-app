import { TestBed } from "@angular/core/testing";
import { FavoriteService } from "./favorite.service";
import { mockCharacter, mockCharacter2 } from "@testing/mocks/character.mock";

describe("FavoriteService", () => {
  let service: FavoriteService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoriteService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should start with empty favorites", () => {
    expect(service.favorites()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  describe("toggleFavorite", () => {
    it("should add a character to favorites", () => {
      service.toggleFavorite(mockCharacter);

      expect(service.favorites()).toEqual([mockCharacter]);
      expect(service.count()).toBe(1);
    });

    it("should remove a character from favorites", () => {
      service.toggleFavorite(mockCharacter);
      service.toggleFavorite(mockCharacter);

      expect(service.favorites()).toEqual([]);
      expect(service.count()).toBe(0);
    });

    it("should handle multiple characters", () => {
      service.toggleFavorite(mockCharacter);
      service.toggleFavorite(mockCharacter2);

      expect(service.count()).toBe(2);
      expect(service.favorites()).toEqual([mockCharacter, mockCharacter2]);
    });

    it("should remove only the targeted character", () => {
      service.toggleFavorite(mockCharacter);
      service.toggleFavorite(mockCharacter2);
      service.toggleFavorite(mockCharacter);

      expect(service.favorites()).toEqual([mockCharacter2]);
    });
  });

  describe("isFavorite", () => {
    it("should return false for non-favorite character", () => {
      expect(service.isFavorite(mockCharacter.id)).toBe(false);
    });

    it("should return true for favorite character", () => {
      service.toggleFavorite(mockCharacter);

      expect(service.isFavorite(mockCharacter.id)).toBe(true);
    });

    it("should return false after removing from favorites", () => {
      service.toggleFavorite(mockCharacter);
      service.toggleFavorite(mockCharacter);

      expect(service.isFavorite(mockCharacter.id)).toBe(false);
    });
  });

  describe("localStorage persistence", () => {
    it("should persist favorites to localStorage", () => {
      service.toggleFavorite(mockCharacter);

      const stored = JSON.parse(localStorage.getItem("favorites")!);
      expect(stored).toEqual([mockCharacter]);
    });

    it("should load favorites from localStorage", () => {
      localStorage.setItem("favorites", JSON.stringify([mockCharacter]));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(FavoriteService);

      expect(newService.favorites()).toEqual([mockCharacter]);
      expect(newService.isFavorite(mockCharacter.id)).toBe(true);
    });

    it("should handle invalid JSON in localStorage", () => {
      localStorage.setItem("favorites", "invalid-json");

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(FavoriteService);

      expect(newService.favorites()).toEqual([]);
    });
  });
});
