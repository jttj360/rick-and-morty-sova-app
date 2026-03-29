import { TestBed } from "@angular/core/testing";
import { ThemeToggleComponent } from "./theme-toggle.component";
import { ThemeService } from "./services/theme.service";
import { signal } from "@angular/core";

describe("ThemeToggleComponent", () => {
  let component: ThemeToggleComponent;
  let themeServiceMock: Partial<ThemeService>;

  beforeEach(async () => {
    themeServiceMock = {
      theme: signal<"light" | "dark">("light"),
      toggle: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [{ provide: ThemeService, useValue: themeServiceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should expose theme signal from service", () => {
    expect(component.theme()).toBe("light");
  });

  it("should expose themeService for template binding", () => {
    expect(component.themeService).toBe(themeServiceMock);
  });
});
