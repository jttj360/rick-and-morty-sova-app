import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CardComponent } from "./card.component";
import { FavoriteService } from "@features/favorites/services/favorite.service";
import { mockCharacter } from "@testing/mocks/character.mock";

describe("CardComponent", () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let favoriteService: FavoriteService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    favoriteService = TestBed.inject(FavoriteService);
    fixture = TestBed.createComponent(CardComponent);
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

  it("should accept character input", () => {
    expect(component.character()).toEqual(mockCharacter);
  });

  it("should emit cardClick with character id on onClick", () => {
    const cardClickSpy = jest.fn();
    component.cardClick.subscribe(cardClickSpy);

    component.onClick();

    expect(cardClickSpy).toHaveBeenCalledWith(mockCharacter.id);
  });

  describe("favorites", () => {
    it("should return false when character is not a favorite", () => {
      expect(component.isFavorite()).toBe(false);
    });

    it("should return true when character is a favorite", () => {
      favoriteService.toggleFavorite(mockCharacter);

      expect(component.isFavorite()).toBe(true);
    });

    it("should toggle favorite and stop event propagation", () => {
      const event = new Event("click");
      jest.spyOn(event, "stopPropagation");

      component.toggleFavorite(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isFavorite()).toBe(true);
    });
  });
});
