import { TestBed } from "@angular/core/testing";
import { ThemeService } from "./theme.service";

describe("ThemeService", () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should default to light theme when no preference", () => {
    expect(service.theme()).toBe("light");
  });

  it("should toggle from light to dark", () => {
    service.toggle();

    expect(service.theme()).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("should toggle from dark to light", () => {
    service.toggle();
    service.toggle();

    expect(service.theme()).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("should persist theme to localStorage", () => {
    service.toggle();

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("should load theme from localStorage", () => {
    localStorage.setItem("theme", "dark");

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(ThemeService);

    expect(newService.theme()).toBe("dark");
  });
});
