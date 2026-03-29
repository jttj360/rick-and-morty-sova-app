import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from "@angular/core";
import { SearchService } from "./services/search/search.service";
import { SearchStateService } from "./services/state/search-state.service";
import { DetailsStateService } from "./components/card-details/state/details-state.service";
import { CharacterDetailsService } from "@features/character-details/services/character-details.service";
import { CardComponent } from "./components/card/card.component";
import { SkeletonCardComponent } from "./components/skeleton-card/skeleton-card.component";
import { SearchToolbarComponent } from "./components/search-toolbar/search-toolbar.component";
import { CharacterFilter } from "@core/models/rick-and-morty";
import { AppError, ErrorType } from "@core/models/app-error";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, map, tap } from "rxjs";
import { CardDetailsComponent } from "./components/card-details/card-details.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";

const ERROR_ICONS: Record<ErrorType, string> = {
  network: "bi bi-wifi-off",
  not_found: "bi bi-search",
  server: "bi bi-hdd-network",
  rate_limit: "bi bi-exclamation-circle",
  unknown: "bi bi-exclamation-circle",
};

@Component({
  selector: "search",
  imports: [
    CardComponent,
    SkeletonCardComponent,
    SearchToolbarComponent,
    CardDetailsComponent,
    LoaderComponent,
  ],
  templateUrl: "./search.component.html",
  styleUrl: "./search.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly searchService = inject(SearchService);
  private readonly characterDetailsService = inject(CharacterDetailsService);
  private readonly searchState = inject(SearchStateService);
  private readonly detailsState = inject(DetailsStateService);

  private readonly scrollThreshold = 250;
  private lastScrollY = 0;

  skeletonCards = Array.from({ length: 10 }, (_, i) => `skeleton-${i}`);
  isToolbarVisible = signal<boolean>(true);
  isCardDetailsVisible = signal<boolean>(false);

  state = this.searchState.state;
  characterList = this.searchState.characterList;
  isLoading = this.searchState.isLoading;
  hasMore = this.searchState.hasMore;
  totalCount = this.searchState.totalCount;
  filters = this.searchState.filters;
  searchError = this.searchState.error;
  retryCountdown = this.searchState.retryCountdown;

  selectedCharacter = this.detailsState.character;
  isLoadingDetails = this.detailsState.isLoading;
  lastEpisode = this.detailsState.episode;
  detailsError = this.detailsState.error;
  isDetailsOpen = this.detailsState.isOpen;

  constructor() {
    this.searchState.reset();
    this.initCharacterDetailsRouting();
    this.searchService.fetchFirstPageCharacters();
  }

  private isScrollScheduled = false;

  @HostListener("window:scroll")
  onWindowScroll(): void {
    if (this.isScrollScheduled) return;

    this.isScrollScheduled = true;
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;

      if (
        currentScrollY > this.lastScrollY &&
        currentScrollY > this.scrollThreshold
      ) {
        this.isToolbarVisible.set(false);
      } else if (currentScrollY < this.lastScrollY) {
        this.isToolbarVisible.set(true);
      }

      this.lastScrollY = currentScrollY;
      this.isScrollScheduled = false;
    });
  }

  onFilterChange(filters: CharacterFilter): void {
    this.searchState.setFilters(filters);
    this.searchService.fetchFirstPageCharacters();
  }

  loadNextPage(): void {
    this.searchService.fetchNextPageCharacters();
  }

  retryPageSearch(): void {
    this.searchService.retryFetchPageCharacters();
  }

  retryDetails(): void {
    this.characterDetailsService.retryFetchCharacterDetails();
  }

  getEmptySubtitle(): string {
    const currentFilters = this.filters();
    const hasFilters = Object.values(currentFilters).some((v) => v);
    return hasFilters
      ? "Try adjusting your search or filters"
      : "Start by searching for a character";
  }

  getErrorIcon(error: AppError): string {
    return ERROR_ICONS[error.type];
  }

  openCharacterDetails(characterId: number): void {
    this.router.navigate([], {
      queryParams: { character: characterId },
    });
  }

  closeCharacterDetails(): void {
    this.router.navigate([], {
      queryParams: { character: null },
    });
  }

  private initCharacterDetailsRouting(): void {
    this.activatedRoute.queryParams
      .pipe(
        map((params) => params["character"] as string | undefined),
        distinctUntilChanged(),
        tap((characterId) => {
          if (characterId) {
            this.isCardDetailsVisible.set(true);
            this.characterDetailsService.openCharacterDetails(
              parseInt(characterId, 10),
              this.searchState.characterList(),
            );
          } else {
            this.isCardDetailsVisible.set(false);
            this.detailsState.reset();
          }
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}
