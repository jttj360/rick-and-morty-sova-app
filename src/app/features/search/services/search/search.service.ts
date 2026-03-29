import { inject, Injectable } from "@angular/core";
import { RickAndMortyApiService } from "@core/services/rick-and-morty-api/rick-and-morty-api.service";
import { RateLimitHandlerService } from "@core/services/rate-limit-handler/rate-limit-handler.service";
import { SearchStateService } from "../state/search-state.service";
import { handleHttpError } from "@core/utils/http-error-handler/http-error-handler";
import { catchError, EMPTY, Subscription } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  private readonly api = inject(RickAndMortyApiService);
  private readonly searchState = inject(SearchStateService);
  private readonly rateLimitHandler = inject(RateLimitHandlerService);

  private lastSearchParams: { page: number; resetList: boolean } = {
    page: 1,
    resetList: true,
  };
  private activeSearch?: Subscription;

  fetchFirstPageCharacters(): void {
    this.getPageCharacters(1, true);
  }

  fetchNextPageCharacters(): void {
    if (this.searchState.isLoading() || !this.searchState.hasMore()) return;
    const nextPage = this.searchState.currentPage() + 1;
    this.getPageCharacters(nextPage, false);
  }

  retryFetchPageCharacters(): void {
    this.getPageCharacters(
      this.lastSearchParams.page,
      this.lastSearchParams.resetList,
    );
  }

  private getPageCharacters(page: number, resetList: boolean): void {
    this.activeSearch?.unsubscribe();
    this.lastSearchParams = { page, resetList };
    this.searchState.setSearchStart(resetList);

    this.activeSearch = this.api
      .getCharacters(page, this.searchState.filters())
      .pipe(
        catchError((error: unknown) => {
          if (
            this.rateLimitHandler.isRateLimited(error) &&
            this.rateLimitHandler.canAutoRetry(error)
          ) {
            return this.rateLimitHandler.waitAndRetry(
              error,
              () => this.api.getCharacters(page, this.searchState.filters()),
              (remaining) => this.searchState.setRetryCountdown(remaining),
            );
          }
          this.searchState.setSearchError(
            handleHttpError(error, "Could not search characters."),
          );
          return EMPTY;
        }),
      )
      .subscribe((response) => {
        this.searchState.setSearchSuccess(response, page, resetList);
      });
  }
}
