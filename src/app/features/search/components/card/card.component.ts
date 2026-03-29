import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { Character } from "@core/models/rick-and-morty";
import { FavoriteService } from "@features/favorites/services/favorite.service";
import { ImageLoaderDirective, ImageState } from "@shared/directives";

@Component({
  selector: "card",
  imports: [ImageLoaderDirective],
  templateUrl: "./card.component.html",
  styleUrl: "./card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  private readonly favoriteService = inject(FavoriteService);

  character = input.required<Character>();
  cardClick = output<number>();

  imageState = signal<ImageState>("loading");
  isFavorite = computed(() =>
    this.favoriteService.isFavorite(this.character().id),
  );

  onClick(): void {
    this.cardClick.emit(this.character().id);
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    this.favoriteService.toggleFavorite(this.character());
  }

  onImageStateChange(state: ImageState): void {
    this.imageState.set(state);
  }
}
