import { inject, Injectable } from "@angular/core";
import { RickAndMortyApiService } from "@core/services/rick-and-morty-api/rick-and-morty-api.service";
import { RateLimitHandlerService } from "@core/services/rate-limit-handler/rate-limit-handler.service";
import { DetailsStateService } from "@features/search/components/card-details/state/details-state.service";
import { Character, Episode } from "@core/models/rick-and-morty";
import { handleHttpError } from "@core/utils/http-error-handler/http-error-handler";
import {
  catchError,
  EMPTY,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  throwError,
} from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CharacterDetailsService {
  private readonly api = inject(RickAndMortyApiService);
  private readonly detailsState = inject(DetailsStateService);
  private readonly rateLimitHandler = inject(RateLimitHandlerService);

  private currentCharacterId: number | null = null;
  private activeRequest?: Subscription;

  openCharacterDetails(id: number, cachedCharacters: Character[] = []): void {
    this.activeRequest?.unsubscribe();
    this.currentCharacterId = id;
    const cached = cachedCharacters.find((c) => c.id === id) ?? null;

    if (cached) {
      this.detailsState.setCharacter(cached);
      this.detailsState.setError(null);
      this.detailsState.setLoading(false);
      this.activeRequest = this.fetchLastEpisode(cached).subscribe(
        (episode) => {
          this.detailsState.setEpisode(episode);
        },
      );
    } else {
      this.getCharacterDetails(id);
    }
  }

  retryFetchCharacterDetails(): void {
    if (this.currentCharacterId !== null) {
      this.getCharacterDetails(this.currentCharacterId);
    }
  }

  private getCharacterDetails(id: number): void {
    this.activeRequest?.unsubscribe();
    this.detailsState.setLoading(true);
    this.detailsState.setCharacter(null);
    this.detailsState.setEpisode(null);
    this.detailsState.setError(null);

    this.activeRequest = this.api
      .getCharacterById(id)
      .pipe(
        catchError((error: unknown) => {
          if (
            this.rateLimitHandler.isRateLimited(error) &&
            this.rateLimitHandler.canAutoRetry(error)
          ) {
            return this.rateLimitHandler.waitAndRetry(error, () =>
              this.api.getCharacterById(id),
            );
          }
          return throwError(() => error);
        }),
        switchMap((character) =>
          this.fetchLastEpisode(character).pipe(
            map((episode) => ({ character, episode })),
          ),
        ),
        catchError((error: unknown) => {
          this.detailsState.setError(
            handleHttpError(error, "Could not load character details."),
          );
          this.detailsState.setLoading(false);
          return EMPTY;
        }),
      )
      .subscribe(({ character, episode }) => {
        this.detailsState.setLoading(false);
        this.detailsState.setCharacter(character);
        this.detailsState.setEpisode(episode);
      });
  }

  private fetchLastEpisode(character: Character): Observable<Episode | null> {
    const lastEpisodeUrl = character.episode[character.episode.length - 1];
    const lastEpisodeId = this.extractIdFromUrl(lastEpisodeUrl);

    if (!lastEpisodeId) return of(null);
    return this.api.getEpisodeById(lastEpisodeId).pipe(
      catchError((error: unknown) => {
        if (
          this.rateLimitHandler.isRateLimited(error) &&
          this.rateLimitHandler.canAutoRetry(error)
        ) {
          return this.rateLimitHandler.waitAndRetry(error, () =>
            this.api.getEpisodeById(lastEpisodeId),
          );
        }
        return of(null);
      }),
    );
  }

  private extractIdFromUrl(url: string): number | null {
    const match = url.match(/\/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }
}
