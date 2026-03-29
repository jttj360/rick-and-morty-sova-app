import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, map, tap } from "rxjs";
import { FavoriteService } from "./services/favorite.service";
import { CharacterDetailsService } from "@features/character-details/services/character-details.service";
import { DetailsStateService } from "@features/search/components/card-details/state/details-state.service";
import { CardComponent } from "@features/search/components/card/card.component";
import { CardDetailsComponent } from "@features/search/components/card-details/card-details.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";

@Component({
  selector: "favorites",
  imports: [CardComponent, CardDetailsComponent, LoaderComponent],
  templateUrl: "./favorites.component.html",
  styleUrl: "./favorites.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly favoriteService = inject(FavoriteService);
  private readonly characterDetailsService = inject(CharacterDetailsService);
  private readonly detailsState = inject(DetailsStateService);

  favorites = this.favoriteService.favorites;
  isCardDetailsVisible = signal<boolean>(false);

  selectedCharacter = this.detailsState.character;
  isLoadingDetails = this.detailsState.isLoading;
  lastEpisode = this.detailsState.episode;
  detailsError = this.detailsState.error;

  constructor() {
    this.initCharacterDetailsRouting();
  }

  openCharacterDetails(characterId: number): void {
    this.router.navigate([], {
      queryParams: { character: characterId },
      queryParamsHandling: "merge",
    });
  }

  closeCharacterDetails(): void {
    this.router.navigate([], {
      queryParams: { character: null },
      queryParamsHandling: "merge",
    });
  }

  retryDetails(): void {
    this.characterDetailsService.retryFetchCharacterDetails();
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
              this.favoriteService.favorites(),
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
