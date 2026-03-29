import { computed, Injectable, signal } from "@angular/core";
import { Character } from "@core/models/rick-and-morty";

const STORAGE_KEY = "favorites";

@Injectable({
  providedIn: "root",
})
export class FavoriteService {
  private readonly favoriteCharacters = signal<Character[]>(
    this.loadFromStorage(),
  );

  readonly favorites = this.favoriteCharacters.asReadonly();
  readonly count = computed(() => this.favoriteCharacters().length);

  isFavorite(id: number): boolean {
    return this.favoriteCharacters().some((c) => c.id === id);
  }

  toggleFavorite(character: Character): void {
    if (this.isFavorite(character.id)) {
      this.favoriteCharacters.update((list) =>
        list.filter((c) => c.id !== character.id),
      );
    } else {
      this.favoriteCharacters.update((list) => [...list, character]);
    }
    this.saveToStorage();
  }

  private loadFromStorage(): Character[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.favoriteCharacters()),
    );
  }
}
