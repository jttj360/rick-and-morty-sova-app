import { Component, signal } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { ImageLoaderDirective, ImageState } from "./image-loader.directive";

@Component({
  template: `
    <img
      [imageLoader]="imageSrc()"
      alt="Test image"
      (stateChange)="onStateChange($event)"
    />
  `,
  imports: [ImageLoaderDirective],
})
class TestHostComponent {
  imageSrc = signal("https://example.com/image.jpg");
  currentState: ImageState = "loading";

  onStateChange(state: ImageState): void {
    this.currentState = state;
  }
}

describe("ImageLoaderDirective", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let imgElement: HTMLImageElement;

  beforeEach(async () => {
    jest.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    imgElement = fixture.nativeElement.querySelector("img");
  });

  afterEach(() => {
    fixture.destroy();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("should create an img element with the directive", () => {
    expect(imgElement).toBeTruthy();
  });

  it("should set the image src from imageLoader input", () => {
    expect(imgElement.src).toBe("https://example.com/image.jpg");
  });

  it("should emit loaded state on successful image load", () => {
    imgElement.dispatchEvent(new Event("load"));

    expect(component.currentState).toBe("loaded");
  });

  it("should remain in loading state immediately after error", () => {
    imgElement.dispatchEvent(new Event("error"));

    expect(component.currentState).toBe("loading");
  });

  it("should emit failed state after placeholder delay when image keeps failing", () => {
    imgElement.dispatchEvent(new Event("error"));
    jest.advanceTimersByTime(5000);

    expect(component.currentState).toBe("failed");
  });

  it("should not emit failed if image loads before placeholder delay", () => {
    imgElement.dispatchEvent(new Event("error"));

    imgElement.dispatchEvent(new Event("load"));
    jest.advanceTimersByTime(5000);

    expect(component.currentState).toBe("loaded");
  });

  it("should retry loading the image with a cache-busting param after error", () => {
    // advance past worst-case jitter (2000ms base + 25% = 2500ms)
    imgElement.dispatchEvent(new Event("error"));
    jest.advanceTimersByTime(2500);

    expect(imgElement.src).toContain("https://example.com/image.jpg?r=1");
  });

  it("should increment retry count on each retry", () => {
    // first error + wait for first retry (2500ms worst case)
    imgElement.dispatchEvent(new Event("error"));
    jest.advanceTimersByTime(2500);

    // second error + wait for second retry (4000ms base + 25% = 5000ms worst case)
    imgElement.dispatchEvent(new Event("error"));
    jest.advanceTimersByTime(5000);

    expect(imgElement.src).toContain("?r=2");
  });

  it("should stop retrying after maxRetries (5)", () => {
    // exhaust all 5 retries
    for (let i = 0; i < 6; i++) {
      imgElement.dispatchEvent(new Event("error"));
      jest.advanceTimersByTime(30000);
    }

    const srcAfterMaxRetries = imgElement.src;

    // trigger another error — should not schedule a new retry
    imgElement.dispatchEvent(new Event("error"));
    jest.advanceTimersByTime(30000);

    expect(imgElement.src).toBe(srcAfterMaxRetries);
  });

  it("should not schedule a new retry while one is pending", () => {
    // fire two errors back to back
    imgElement.dispatchEvent(new Event("error"));
    imgElement.dispatchEvent(new Event("error"));

    // advance past worst-case jitter for first retry
    jest.advanceTimersByTime(2500);

    expect(imgElement.src).toContain("?r=1");
  });

  it("should clean up timeouts on destroy", () => {
    imgElement.dispatchEvent(new Event("error"));

    fixture.destroy();
    jest.advanceTimersByTime(30000);

    expect(component.currentState).toBe("loading");
  });

  it("should clean up timeouts on successful load", () => {
    // trigger error to start retry timer
    imgElement.dispatchEvent(new Event("error"));

    imgElement.dispatchEvent(new Event("load"));

    const srcAfterLoad = imgElement.src;
    jest.advanceTimersByTime(30000);
    expect(imgElement.src).toBe(srcAfterLoad);
  });

  it("should not start a placeholder timeout if one is already active", () => {
    imgElement.dispatchEvent(new Event("error"));
    imgElement.dispatchEvent(new Event("error"));

    jest.advanceTimersByTime(5000);

    expect(component.currentState).toBe("failed");
  });
});
