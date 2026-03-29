import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CardDetailsComponent } from "./card-details.component";
import { FavoriteService } from "@features/favorites/services/favorite.service";
import { mockCharacter, mockEpisode } from "@testing/mocks/character.mock";

describe("CardDetailsComponent", () => {
  let component: CardDetailsComponent;
  let fixture: ComponentFixture<CardDetailsComponent>;
  let favoriteService: FavoriteService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CardDetailsComponent],
    }).compileComponents();

    favoriteService = TestBed.inject(FavoriteService);
    fixture = TestBed.createComponent(CardDetailsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("character", mockCharacter);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should accept required character input", () => {
    expect(component.character()).toEqual(mockCharacter);
  });

  it("should default lastEpisode to null", () => {
    expect(component.lastEpisode()).toBeNull();
  });

  it("should accept lastEpisode input", () => {
    fixture.componentRef.setInput("lastEpisode", mockEpisode);
    fixture.detectChanges();

    expect(component.lastEpisode()).toEqual(mockEpisode);
  });

  describe("favorites", () => {
    it("should return false when character is not a favorite", () => {
      expect(component.isFavorite()).toBe(false);
    });

    it("should return true when character is a favorite", () => {
      favoriteService.toggleFavorite(mockCharacter);

      expect(component.isFavorite()).toBe(true);
    });

    it("should toggle favorite", () => {
      component.toggleFavorite();

      expect(component.isFavorite()).toBe(true);

      component.toggleFavorite();

      expect(component.isFavorite()).toBe(false);
    });
  });
});
