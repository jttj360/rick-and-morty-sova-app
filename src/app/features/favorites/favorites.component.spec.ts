import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { signal } from "@angular/core";
import { FavoritesComponent } from "./favorites.component";
import { FavoriteService } from "./services/favorite.service";
import { CharacterDetailsService } from "@features/character-details/services/character-details.service";
import { DetailsStateService } from "@features/search/components/card-details/state/details-state.service";
import { Character } from "@core/models/rick-and-morty";

describe("FavoritesComponent", () => {
  let component: FavoritesComponent;
  let router: Router;
  let queryParamsSubject: Subject<Record<string, string>>;
  let mockFavoriteService: Partial<FavoriteService>;
  let mockCharacterDetailsService: Partial<CharacterDetailsService>;
  let mockDetailsState: Partial<DetailsStateService>;

  const mockCharacter: Character = {
    id: 1,
    name: "Rick Sanchez",
    status: "Alive",
    species: "Human",
    type: "",
    gender: "Male",
    origin: { name: "Earth", url: "" },
    location: { name: "Citadel", url: "" },
    image: "rick.png",
    episode: ["ep1"],
    url: "",
    created: "",
  };

  beforeEach(async () => {
    queryParamsSubject = new Subject();

    mockFavoriteService = {
      favorites: signal<Character[]>([mockCharacter]),
    };

    mockCharacterDetailsService = {
      openCharacterDetails: jest.fn(),
      retryFetchCharacterDetails: jest.fn(),
    };

    mockDetailsState = {
      character: signal<Character | null>(null),
      isLoading: signal(false),
      episode: signal(null),
      error: signal(null),
      reset: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParamsSubject.asObservable() },
        },
        { provide: FavoriteService, useValue: mockFavoriteService },
        {
          provide: CharacterDetailsService,
          useValue: mockCharacterDetailsService,
        },
        { provide: DetailsStateService, useValue: mockDetailsState },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, "navigate").mockResolvedValue(true);

    const fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should expose favorites from FavoriteService", () => {
    expect(component.favorites()).toEqual([mockCharacter]);
  });

  it("should navigate with character query param on openCharacterDetails", () => {
    component.openCharacterDetails(42);

    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: { character: 42 },
      queryParamsHandling: "merge",
    });
  });

  it("should navigate with null character query param on closeCharacterDetails", () => {
    component.closeCharacterDetails();

    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: { character: null },
      queryParamsHandling: "merge",
    });
  });

  it("should delegate retryDetails to character details service", () => {
    component.retryDetails();

    expect(
      mockCharacterDetailsService.retryFetchCharacterDetails,
    ).toHaveBeenCalled();
  });

  describe("initCharacterDetailsRouting", () => {
    it("should open details when character param is emitted", () => {
      queryParamsSubject.next({ character: "7" });

      expect(component.isCardDetailsVisible()).toBe(true);
      expect(
        mockCharacterDetailsService.openCharacterDetails,
      ).toHaveBeenCalledWith(7, [mockCharacter]);
    });

    it("should close details and reset state when character param is removed", () => {
      queryParamsSubject.next({ character: "7" });

      queryParamsSubject.next({});

      expect(component.isCardDetailsVisible()).toBe(false);
      expect(mockDetailsState.reset).toHaveBeenCalled();
    });

    it("should not re-trigger when same character param is emitted", () => {
      queryParamsSubject.next({ character: "7" });
      queryParamsSubject.next({ character: "7" });

      expect(
        mockCharacterDetailsService.openCharacterDetails,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
