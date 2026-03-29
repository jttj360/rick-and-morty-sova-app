import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FilterDropdownComponent } from "@shared/components/filter-dropdown/filter-dropdown.component";

describe("FilterDropdownComponent", () => {
  let component: FilterDropdownComponent;
  let fixture: ComponentFixture<FilterDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterDropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterDropdownComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("options", ["Alive", "Dead", "Unknown"]);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have unique dropdownId", () => {
    expect(component.dropdownId).toMatch(/^dropdown-[a-z0-9]+$/);
  });

  describe("toggle", () => {
    it("should toggle isOpen from false to true", () => {
      expect(component.isOpen()).toBe(false);

      component.toggle();

      expect(component.isOpen()).toBe(true);
    });

    it("should toggle isOpen from true to false", () => {
      component.isOpen.set(true);

      component.toggle();

      expect(component.isOpen()).toBe(false);
    });

    it("should reset focusedIndex when closing", () => {
      component.isOpen.set(true);
      component.focusedIndex.set(2);

      component.toggle();

      expect(component.focusedIndex()).toBe(-1);
    });
  });

  describe("select", () => {
    it("should set selectedValue", () => {
      component.select("Alive");

      expect(component.selectedValue()).toBe("Alive");
    });

    it("should emit change with selected value", () => {
      const changeSpy = jest.fn();
      component.change.subscribe(changeSpy);

      component.select("Alive");

      expect(changeSpy).toHaveBeenCalledWith("Alive");
    });

    it("should close dropdown after selection", () => {
      component.isOpen.set(true);

      component.select("Alive");

      expect(component.isOpen()).toBe(false);
    });
  });

  describe("clear", () => {
    it("should reset selectedValue to empty string", () => {
      component.selectedValue.set("Alive");

      component.clear();

      expect(component.selectedValue()).toBe("");
    });

    it("should emit change with empty string", () => {
      const changeSpy = jest.fn();
      component.change.subscribe(changeSpy);
      component.selectedValue.set("Alive");

      component.clear();

      expect(changeSpy).toHaveBeenCalledWith("");
    });

    it("should close dropdown after clearing", () => {
      component.isOpen.set(true);

      component.clear();

      expect(component.isOpen()).toBe(false);
    });
  });

  describe("close", () => {
    it("should set isOpen to false", () => {
      component.isOpen.set(true);

      component.close();

      expect(component.isOpen()).toBe(false);
    });

    it("should reset focusedIndex", () => {
      component.focusedIndex.set(2);

      component.close();

      expect(component.focusedIndex()).toBe(-1);
    });
  });

  describe("onArrowDown", () => {
    const mockEvent = { preventDefault: jest.fn() } as unknown as Event;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should open dropdown if closed", () => {
      component.isOpen.set(false);

      component.onArrowDown(mockEvent);

      expect(component.isOpen()).toBe(true);
    });

    it("should increment focusedIndex", () => {
      component.isOpen.set(true);
      component.focusedIndex.set(0);

      component.onArrowDown(mockEvent);

      expect(component.focusedIndex()).toBe(1);
    });

    it("should not exceed options length", () => {
      component.isOpen.set(true);
      component.focusedIndex.set(3);

      component.onArrowDown(mockEvent);

      expect(component.focusedIndex()).toBe(3);
    });

    it("should prevent default", () => {
      component.onArrowDown(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe("onArrowUp", () => {
    const mockEvent = { preventDefault: jest.fn() } as unknown as Event;

    it("should decrement focusedIndex", () => {
      component.focusedIndex.set(2);

      component.onArrowUp(mockEvent);

      expect(component.focusedIndex()).toBe(1);
    });

    it("should not go below 0", () => {
      component.focusedIndex.set(0);

      component.onArrowUp(mockEvent);

      expect(component.focusedIndex()).toBe(0);
    });
  });

  describe("onEnter", () => {
    it("should clear when focusedIndex is 0 (All option)", () => {
      component.selectedValue.set("Alive");
      component.focusedIndex.set(0);

      component.onEnter();

      expect(component.selectedValue()).toBe("");
    });

    it("should select option when focusedIndex > 0", () => {
      component.focusedIndex.set(1);

      component.onEnter();

      expect(component.selectedValue()).toBe("Alive");
    });

    it("should do nothing when focusedIndex is -1", () => {
      const changeSpy = jest.fn();
      component.change.subscribe(changeSpy);
      component.focusedIndex.set(-1);

      component.onEnter();

      expect(changeSpy).not.toHaveBeenCalled();
    });
  });

  describe("onClickOutside", () => {
    it("should close dropdown when clicking outside", () => {
      component.isOpen.set(true);
      const outsideElement = document.createElement("div");

      component.onClickOutside({ target: outsideElement } as unknown as Event);

      expect(component.isOpen()).toBe(false);
    });

    it("should not close dropdown when clicking inside", () => {
      component.isOpen.set(true);
      const insideElement = fixture.nativeElement;

      component.onClickOutside({ target: insideElement } as unknown as Event);

      expect(component.isOpen()).toBe(true);
    });
  });

  describe("inputs", () => {
    it("should accept label input", () => {
      fixture.componentRef.setInput("label", "Status");
      fixture.detectChanges();

      expect(component.label()).toBe("Status");
    });

    it("should accept options input", () => {
      const options = ["Alive", "Dead", "Unknown"];
      fixture.componentRef.setInput("options", options);
      fixture.detectChanges();

      expect(component.options()).toEqual(options);
    });
  });
});
