import { computed, Injectable, signal } from "@angular/core";
import { Character, Episode } from "@core/models/rick-and-morty";
import { AppError } from "@core/models/app-error";

@Injectable({
  providedIn: "root",
})
export class DetailsStateService {
  private readonly selectedCharacter = signal<Character | null>(null);
  private readonly lastEpisode = signal<Episode | null>(null);
  private readonly loading = signal(false);
  private readonly detailError = signal<AppError | null>(null);

  readonly character = this.selectedCharacter.asReadonly();
  readonly episode = this.lastEpisode.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly error = this.detailError.asReadonly();

  readonly isOpen = computed(
    () => this.selectedCharacter() !== null || this.loading(),
  );

  setCharacter(character: Character | null): void {
    this.selectedCharacter.set(character);
  }

  setEpisode(episode: Episode | null): void {
    this.lastEpisode.set(episode);
  }

  setLoading(loading: boolean): void {
    this.loading.set(loading);
  }

  setError(error: AppError | null): void {
    this.detailError.set(error);
  }

  reset(): void {
    this.selectedCharacter.set(null);
    this.lastEpisode.set(null);
    this.loading.set(false);
    this.detailError.set(null);
  }
}
