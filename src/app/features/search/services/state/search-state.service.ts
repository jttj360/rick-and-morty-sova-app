import { computed, Injectable, signal } from "@angular/core";
import {
  Character,
  CharacterFilter,
  RickAndMortyResponse,
} from "@core/models/rick-and-morty";
import { AppError } from "@core/models/app-error";

export type SearchStatus = "loading" | "success" | "empty";

export interface SearchState {
  status: SearchStatus;
}

@Injectable({
  providedIn: "root",
})
export class SearchStateService {
  private readonly characters = signal<Character[]>([]);
  private readonly activeFilters = signal<CharacterFilter>({});
  private readonly page = signal(0);
  private readonly pages = signal(0);
  private readonly count = signal(0);
  private readonly loading = signal(false);
  private readonly searchError = signal<AppError | null>(null);
  private readonly countdown = signal<number | null>(null);
  private readonly searched = signal(false);

  readonly characterList = this.characters.asReadonly();
  readonly filters = this.activeFilters.asReadonly();
  readonly currentPage = this.page.asReadonly();
  readonly totalPages = this.pages.asReadonly();
  readonly totalCount = this.count.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly error = this.searchError.asReadonly();
  readonly retryCountdown = this.countdown.asReadonly();
  readonly hasSearched = this.searched.asReadonly();

  readonly hasMore = computed(() => this.page() < this.pages());

  readonly isEmpty = computed(
    () => this.characters().length === 0 && this.searched() && !this.loading(),
  );

  readonly state = computed<SearchState>(() => {
    if (this.characters().length > 0) {
      return { status: "success" };
    }
    if (this.loading()) {
      return { status: "loading" };
    }
    if (this.isEmpty()) {
      return { status: "empty" };
    }
    return { status: "loading" };
  });

  setFilters(filters: CharacterFilter): void {
    this.activeFilters.set(filters);
  }

  setRetryCountdown(value: number | null): void {
    this.countdown.set(value);
  }

  setSearchStart(resetList: boolean): void {
    this.loading.set(true);
    if (resetList) {
      this.searchError.set(null);
      this.characters.set([]);
      this.pages.set(0);
      this.count.set(0);
      this.countdown.set(null);
    }
  }

  setSearchSuccess(
    response: RickAndMortyResponse<Character>,
    page: number,
    resetList: boolean,
  ): void {
    this.countdown.set(null);
    this.searchError.set(null);
    if (resetList) {
      this.characters.set(response.results);
    } else {
      this.characters.update((current) => [...current, ...response.results]);
    }
    this.pages.set(response.info.pages);
    this.count.set(response.info.count);
    this.page.set(page);
    this.loading.set(false);
    this.searched.set(true);
  }

  setSearchError(error: AppError): void {
    this.loading.set(false);
    this.searchError.set(error);
    this.searched.set(true);
  }

  reset(): void {
    this.characters.set([]);
    this.activeFilters.set({});
    this.page.set(0);
    this.pages.set(0);
    this.count.set(0);
    this.loading.set(false);
    this.searchError.set(null);
    this.countdown.set(null);
    this.searched.set(false);
  }
}
