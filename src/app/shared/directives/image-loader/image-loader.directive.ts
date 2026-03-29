import {
  Directive,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
} from "@angular/core";

export type ImageState = "loading" | "loaded" | "failed";

@Directive({
  selector: "img[imageLoader]",
  standalone: true,
  host: {
    "(load)": "onLoad()",
    "(error)": "onError()",
  },
})
export class ImageLoaderDirective implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly el = inject(ElementRef<HTMLImageElement>);

  private readonly placeholderDelay = 5000;
  private readonly initialRetryDelay = 2000;
  private readonly maxRetryDelay = 30000;
  private readonly maxRetries = 5;

  private placeholderTimeout: ReturnType<typeof setTimeout> | null = null;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private retryCount = 0;
  private originalSrc = "";
  private currentState: ImageState = "loading";

  imageLoader = input.required<string>();

  stateChange = output<ImageState>();

  ngOnInit(): void {
    this.originalSrc = this.imageLoader();
    if (this.originalSrc) {
      this.el.nativeElement.src = this.originalSrc;
    }
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  onLoad(): void {
    this.cleanup();
    this.setState("loaded");
  }

  onError(): void {
    if (!this.placeholderTimeout && this.currentState === "loading") {
      this.placeholderTimeout = setTimeout(() => {
        if (this.currentState !== "loaded") {
          this.setState("failed");
        }
      }, this.placeholderDelay);
    }

    this.scheduleRetry();
  }

  private setState(state: ImageState): void {
    this.currentState = state;
    this.stateChange.emit(state);
  }

  private scheduleRetry(): void {
    if (this.retryTimeout || this.retryCount >= this.maxRetries) return;

    const baseDelay = Math.min(
      this.initialRetryDelay * Math.pow(2, this.retryCount),
      this.maxRetryDelay,
    );
    const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1);
    const delay = Math.max(1000, baseDelay + jitter);

    this.retryCount++;

    this.retryTimeout = setTimeout(() => {
      this.retryTimeout = null;
      if (this.currentState !== "loaded") {
        this.el.nativeElement.src = `${this.originalSrc}?r=${this.retryCount}`;
      }
    }, delay);
  }

  private cleanup(): void {
    if (this.placeholderTimeout) {
      clearTimeout(this.placeholderTimeout);
      this.placeholderTimeout = null;
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }
}
