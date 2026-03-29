import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { Character, Episode } from "@core/models/rick-and-morty";
import { FavoriteService } from "@features/favorites/services/favorite.service";
import { ImageLoaderDirective, ImageState } from "@shared/directives";

@Component({
  selector: "card-details",
  imports: [ImageLoaderDirective],
  templateUrl: "./card-details.component.html",
  styleUrl: "./card-details.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDetailsComponent {
  private readonly favoriteService = inject(FavoriteService);

  character = input.required<Character>();
  lastEpisode = input<Episode | null>(null);

  imageState = signal<ImageState>("loading");

  isFavorite(): boolean {
    return this.favoriteService.isFavorite(this.character().id);
  }

  toggleFavorite(): void {
    this.favoriteService.toggleFavorite(this.character());
  }

  onImageStateChange(state: ImageState): void {
    this.imageState.set(state);
  }
}
