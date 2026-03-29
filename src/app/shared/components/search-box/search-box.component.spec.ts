import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { SearchBoxComponent } from "./search-box.component";

describe("SearchBoxComponent", () => {
  let component: SearchBoxComponent;
  let fixture: ComponentFixture<SearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize FormControl with empty string", () => {
    expect(component.searchControl.value).toBe("");
  });

  describe("search emission", () => {
    it("should emit search value after debounce time", fakeAsync(() => {
      const searchSpy = jest.fn();
      component.search.subscribe(searchSpy);

      component.searchControl.setValue("Rick");
      tick(300);

      expect(searchSpy).toHaveBeenCalledWith("Rick");
    }));

    it("should not emit before debounce time completes", fakeAsync(() => {
      const searchSpy = jest.fn();
      component.search.subscribe(searchSpy);

      component.searchControl.setValue("Rick");
      tick(200);

      expect(searchSpy).not.toHaveBeenCalled();

      tick(100);
      expect(searchSpy).toHaveBeenCalledWith("Rick");
    }));

    it("should not emit duplicate consecutive values", fakeAsync(() => {
      const searchSpy = jest.fn();
      component.search.subscribe(searchSpy);

      component.searchControl.setValue("Rick");
      tick(300);
      component.searchControl.setValue("Rick");
      tick(300);

      expect(searchSpy).toHaveBeenCalledTimes(1);
    }));

    it("should emit when value changes to different value", fakeAsync(() => {
      const searchSpy = jest.fn();
      component.search.subscribe(searchSpy);

      component.searchControl.setValue("Rick");
      tick(300);
      component.searchControl.setValue("Morty");
      tick(300);

      expect(searchSpy).toHaveBeenCalledTimes(2);
      expect(searchSpy).toHaveBeenNthCalledWith(1, "Rick");
      expect(searchSpy).toHaveBeenNthCalledWith(2, "Morty");
    }));
  });

  describe("pattern validation", () => {
    it("should not emit when pattern validation fails", fakeAsync(() => {
      fixture = TestBed.createComponent(SearchBoxComponent);
      fixture.componentRef.setInput("pattern", /^[a-zA-Z]+$/);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const searchSpy = jest.fn();
      component.search.subscribe(searchSpy);

      component.searchControl.setValue("123");
      tick(300);

      expect(component.searchControl.valid).toBe(false);
      expect(searchSpy).not.toHaveBeenCalled();
    }));

    it("should emit when pattern validation passes", fakeAsync(() => {
      fixture = TestBed.createComponent(SearchBoxComponent);
      fixture.componentRef.setInput("pattern", /^[a-zA-Z]+$/);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const searchSpy = jest.fn();
      component.search.subscribe(searchSpy);

      component.searchControl.setValue("Rick");
      tick(300);

      expect(component.searchControl.valid).toBe(true);
      expect(searchSpy).toHaveBeenCalledWith("Rick");
    }));

    it("should set validation error for invalid pattern", fakeAsync(() => {
      fixture = TestBed.createComponent(SearchBoxComponent);
      fixture.componentRef.setInput("pattern", /^[a-zA-Z]+$/);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.searchControl.setValue("123!@#");
      tick(300);

      expect(component.searchControl.errors).toHaveProperty("pattern");
    }));
  });

  it("should accept custom debounce time", fakeAsync(() => {
    fixture = TestBed.createComponent(SearchBoxComponent);
    fixture.componentRef.setInput("debounce", 500);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const searchSpy = jest.fn();
    component.search.subscribe(searchSpy);

    component.searchControl.setValue("Rick");
    tick(300);
    expect(searchSpy).not.toHaveBeenCalled();

    tick(200);
    expect(searchSpy).toHaveBeenCalledWith("Rick");
  }));
});
