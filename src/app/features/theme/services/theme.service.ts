import { Injectable, signal } from "@angular/core";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly currentTheme = signal<Theme>(this.getInitialTheme());

  readonly theme = this.currentTheme.asReadonly();

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggle(): void {
    const newTheme = this.currentTheme() === "light" ? "dark" : "light";
    this.currentTheme.set(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) return stored;
    return "light";
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute("data-theme", theme);
  }
}
