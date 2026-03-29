import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "filter-dropdown",
  imports: [ReactiveFormsModule],
  templateUrl: "./filter-dropdown.component.html",
  styleUrl: "./filter-dropdown.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(document:click)": "onClickOutside($event)",
  },
})
export class FilterDropdownComponent {
  private readonly elementRef = inject(ElementRef);

  label = input("Filter");
  options = input<readonly string[]>([]);

  change = output<string>();

  isOpen = signal(false);
  selectedValue = signal("");
  focusedIndex = signal(-1);

  readonly dropdownId = `dropdown-${Math.random().toString(36).slice(2, 9)}`;

  toggle(): void {
    this.isOpen.update((open) => !open);
    if (!this.isOpen()) {
      this.focusedIndex.set(-1);
    }
  }

  select(option: string): void {
    this.selectedValue.set(option);
    this.change.emit(option);
    this.close();
  }

  clear(): void {
    this.selectedValue.set("");
    this.change.emit("");
    this.close();
  }

  close(): void {
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
  }

  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  onArrowDown(event: Event): void {
    event.preventDefault();
    if (!this.isOpen()) {
      this.isOpen.set(true);
    }
    const max = this.options().length;
    this.focusedIndex.update((i) => Math.min(i + 1, max));
  }

  onArrowUp(event: Event): void {
    event.preventDefault();
    this.focusedIndex.update((i) => Math.max(i - 1, 0));
  }

  onEnter(): void {
    const idx = this.focusedIndex();
    if (idx === 0) {
      this.clear();
    } else if (idx > 0) {
      this.select(this.options()[idx - 1]);
    }
  }
}
