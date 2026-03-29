import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ThemeService } from "./services/theme.service";

@Component({
  selector: "theme-toggle",
  imports: [],
  template: `
    <button
      type="button"
      class="btn-icon-outline"
      (click)="themeService.toggle()"
      [attr.aria-label]="
        theme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
      "
    >
      @if (theme() === "light") {
        <i class="bi bi-moon icon-20" aria-hidden="true"></i>
      } @else {
        <i class="bi bi-sun icon-20" aria-hidden="true"></i>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
  readonly theme = this.themeService.theme;
}
