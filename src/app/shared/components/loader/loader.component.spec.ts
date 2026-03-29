import { TestBed } from "@angular/core/testing";
import { LoaderComponent } from "./loader.component";

describe("LoaderComponent", () => {
  let component: LoaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should default size to md", () => {
    expect(component.size()).toBe("md");
  });

  it("should default ariaLabel to Loading", () => {
    expect(component.ariaLabel()).toBe("Loading");
  });

  it("should accept size input", () => {
    const fixture = TestBed.createComponent(LoaderComponent);
    fixture.componentRef.setInput("size", "lg");

    expect(fixture.componentInstance.size()).toBe("lg");
  });

  it("should accept ariaLabel input", () => {
    const fixture = TestBed.createComponent(LoaderComponent);
    fixture.componentRef.setInput("ariaLabel", "Loading characters");

    expect(fixture.componentInstance.ariaLabel()).toBe("Loading characters");
  });
});
