import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SearchComponent } from "./search.component";
import { SearchService } from "./services/search/search.service";
import { SearchStateService } from "./services/state/search-state.service";
import { DetailsStateService } from "./components/card-details/state/details-state.service";
import { CharacterDetailsService } from "@features/character-details/services/character-details.service";
import { Router, ActivatedRoute } from "@angular/router";
import { computed, signal } from "@angular/core";
import { of } from "rxjs";
import { mockCharacter } from "@testing/mocks/character.mock";
import { createAppError } from "@core/utils/app-error/app-error";
import { AppError } from "@core/models/app-error";

describe("SearchComponent", () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let searchServiceMock: jest.Mocked<SearchService>;
  let characterDetailsServiceMock: jest.Mocked<CharacterDetailsService>;
  let searchStateMock: Partial<SearchStateService>;
  let detailsStateMock: Partial<DetailsStateService>;
  let routerMock: jest.Mocked<Router>;

  beforeEach(async () => {
    searchServiceMock = {
      fetchFirstPageCharacters: jest.fn(),
      fetchNextPageCharacters: jest.fn(),
      retryFetchPageCharacters: jest.fn(),
    } as unknown as jest.Mocked<SearchService>;

    characterDetailsServiceMock = {
      openCharacterDetails: jest.fn(),
      retryFetchCharacterDetails: jest.fn(),
    } as unknown as jest.Mocked<CharacterDetailsService>;

    const characterList = signal([mockCharacter]);
    const isLoading = signal(false);
    const hasSearched = signal(true);
    const error = signal<AppError | null>(null);
    const filters = signal({});
    const retryCountdown = signal<number | null>(null);

    searchStateMock = {
      characterList,
      isLoading,
      hasMore: computed(() => true),
      totalCount: signal(1),
      filters,
      hasSearched,
      error,
      retryCountdown,
      isEmpty: computed(
        () => characterList().length === 0 && hasSearched() && !isLoading(),
      ),
      state: computed(() => {
        if (characterList().length > 0) return { status: "success" as const };
        if (isLoading()) return { status: "loading" as const };
        if (characterList().length === 0 && hasSearched())
          return { status: "empty" as const };
        return { status: "loading" as const };
      }),
      setFilters: jest.fn((f) => filters.set(f)),
      reset: jest.fn(),
    };

    detailsStateMock = {
      character: signal(null),
      isLoading: signal(false),
      episode: signal(null),
      error: signal(null),
      isOpen: computed(() => false),
      reset: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        { provide: SearchService, useValue: searchServiceMock },
        {
          provide: CharacterDetailsService,
          useValue: characterDetailsServiceMock,
        },
        { provide: SearchStateService, useValue: searchStateMock },
        { provide: DetailsStateService, useValue: detailsStateMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({}) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call fetchFirstPageCharacters on construction", () => {
    expect(searchServiceMock.fetchFirstPageCharacters).toHaveBeenCalled();
  });

  it("should have 10 skeleton cards", () => {
    expect(component.skeletonCards.length).toBe(10);
  });

  it("should set filters in state and call fetchFirstPageCharacters on filter change", () => {
    const filters = { name: "Rick", status: "Alive" };
    searchServiceMock.fetchFirstPageCharacters.mockClear();

    component.onFilterChange(filters);

    expect(searchStateMock.setFilters).toHaveBeenCalledWith(filters);
    expect(searchServiceMock.fetchFirstPageCharacters).toHaveBeenCalled();
  });

  it("should call searchService.fetchNextPageCharacters on loadNextPage", () => {
    component.loadNextPage();

    expect(searchServiceMock.fetchNextPageCharacters).toHaveBeenCalled();
  });

  it("should call searchService.retryFetchPageCharacters on retryPageSearch", () => {
    component.retryPageSearch();

    expect(searchServiceMock.retryFetchPageCharacters).toHaveBeenCalled();
  });

  it("should call characterDetailsService.retryFetchCharacterDetails on retryDetails", () => {
    component.retryDetails();

    expect(
      characterDetailsServiceMock.retryFetchCharacterDetails,
    ).toHaveBeenCalled();
  });

  describe("getEmptySubtitle", () => {
    it("should return filter message when filters are set", () => {
      (searchStateMock.filters as any).set({ name: "Rick" });

      const result = component.getEmptySubtitle();

      expect(result).toBe("Try adjusting your search or filters");
    });

    it("should return start message when no filters", () => {
      (searchStateMock.filters as any).set({});

      const result = component.getEmptySubtitle();

      expect(result).toBe("Start by searching for a character");
    });

    describe("getErrorIcon", () => {
      it("should return correct icon for network error", () => {
        const error = createAppError("network", "Network error");

        expect(component.getErrorIcon(error)).toBe("bi bi-wifi-off");
      });

      it("should return correct icon for not_found error", () => {
        const error = createAppError("not_found", "Not found");

        expect(component.getErrorIcon(error)).toBe("bi bi-search");
      });

      it("should return correct icon for server error", () => {
        const error = createAppError("server", "Server error");

        expect(component.getErrorIcon(error)).toBe("bi bi-hdd-network");
      });

      it("should return correct icon for unknown error", () => {
        const error = createAppError("unknown", "Unknown error");

        expect(component.getErrorIcon(error)).toBe("bi bi-exclamation-circle");
      });
    });

    it("should navigate with character query param on openCharacterDetails", () => {
      component.openCharacterDetails(1);

      expect(routerMock.navigate).toHaveBeenCalledWith([], {
        queryParams: { character: 1 },
      });
    });

    it("should navigate with null character query param on closeCharacterDetails", () => {
      component.closeCharacterDetails();

      expect(routerMock.navigate).toHaveBeenCalledWith([], {
        queryParams: { character: null },
      });
    });

    describe("toolbar visibility", () => {
      beforeEach(() => {
        jest
          .spyOn(window, "requestAnimationFrame")
          .mockImplementation((callback) => {
            callback(0);
            return 0;
          });
      });

      it("should start with toolbar visible", () => {
        expect(component.isToolbarVisible()).toBe(true);
      });

      it("should hide toolbar when scrolling down past threshold", () => {
        Object.defineProperty(window, "scrollY", {
          value: 300,
          writable: true,
        });

        component.onWindowScroll();

        expect(component.isToolbarVisible()).toBe(false);
      });

      it("should show toolbar when scrolling up", () => {
        Object.defineProperty(window, "scrollY", {
          value: 300,
          writable: true,
        });
        component.onWindowScroll();
        Object.defineProperty(window, "scrollY", {
          value: 200,
          writable: true,
        });

        component.onWindowScroll();

        expect(component.isToolbarVisible()).toBe(true);
      });

      it("should not hide toolbar when scroll is below threshold", () => {
        Object.defineProperty(window, "scrollY", {
          value: 200,
          writable: true,
        });

        component.onWindowScroll();

        expect(component.isToolbarVisible()).toBe(true);
      });
    });
  });
});
