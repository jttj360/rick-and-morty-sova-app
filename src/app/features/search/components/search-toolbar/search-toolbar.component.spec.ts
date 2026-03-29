import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SearchToolbarComponent } from "./search-toolbar.component";

describe("SearchToolbarComponent", () => {
  let component: SearchToolbarComponent;
  let fixture: ComponentFixture<SearchToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchToolbarComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have filter options available", () => {
    expect(component.statusOptions).toEqual(["Alive", "Dead", "unknown"]);
    expect(component.genderOptions).toEqual([
      "Female",
      "Male",
      "Genderless",
      "Unknown",
    ]);
    expect(component.speciesOptions.length).toBeGreaterThan(0);
  });

  describe("onSearchChange", () => {
    it("should emit filterChange with name", () => {
      const filterChangeSpy = jest.fn();
      component.filterChange.subscribe(filterChangeSpy);

      component.onSearchChange("Rick");

      expect(filterChangeSpy).toHaveBeenCalledWith({ name: "Rick" });
    });

    it("should emit filterChange with undefined name for empty string", () => {
      const filterChangeSpy = jest.fn();
      component.filterChange.subscribe(filterChangeSpy);

      component.onSearchChange("");

      expect(filterChangeSpy).toHaveBeenCalledWith({ name: undefined });
    });
  });

  describe("onStatusChange", () => {
    it("should emit filterChange with status", () => {
      const filterChangeSpy = jest.fn();
      component.filterChange.subscribe(filterChangeSpy);

      component.onStatusChange("Alive");

      expect(filterChangeSpy).toHaveBeenCalledWith({ status: "Alive" });
    });

    it("should emit filterChange with undefined status for empty string", () => {
      const filterChangeSpy = jest.fn();
      component.filterChange.subscribe(filterChangeSpy);

      component.onStatusChange("");

      expect(filterChangeSpy).toHaveBeenCalledWith({ status: undefined });
    });
  });

  it("should emit filterChange with species on onSpeciesChange", () => {
    const filterChangeSpy = jest.fn();
    component.filterChange.subscribe(filterChangeSpy);

    component.onSpeciesChange("Human");

    expect(filterChangeSpy).toHaveBeenCalledWith({ species: "Human" });
  });

  it("should emit filterChange with gender on onGenderChange", () => {
    const filterChangeSpy = jest.fn();
    component.filterChange.subscribe(filterChangeSpy);

    component.onGenderChange("Male");

    expect(filterChangeSpy).toHaveBeenCalledWith({ gender: "Male" });
  });

  it("should accumulate multiple filter changes", () => {
    const filterChangeSpy = jest.fn();
    component.filterChange.subscribe(filterChangeSpy);

    component.onSearchChange("Rick");
    component.onStatusChange("Alive");
    component.onGenderChange("Male");

    expect(filterChangeSpy).toHaveBeenLastCalledWith({
      name: "Rick",
      status: "Alive",
      gender: "Male",
    });
  });
});
