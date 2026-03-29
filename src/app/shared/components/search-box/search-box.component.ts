import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
  selector: "search-box",
  imports: [ReactiveFormsModule],
  templateUrl: "./search-box.component.html",
  styleUrl: "./search-box.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  label = input<string>("");
  placeholder = input<string>("Search...");
  errorMessage = input<string>("Invalid characters");
  debounce = input<number>(300);
  pattern = input<RegExp | null>(null);

  search = output<string>();

  searchControl = new FormControl("");

  ngOnInit(): void {
    const patternValue = this.pattern();
    if (patternValue) {
      this.searchControl.setValidators([Validators.pattern(patternValue)]);
      this.searchControl.updateValueAndValidity();
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounce()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        if (this.searchControl.valid) {
          this.search.emit(value ?? "");
        }
      });
  }
}
