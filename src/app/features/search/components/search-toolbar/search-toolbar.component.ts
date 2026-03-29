import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { SearchBoxComponent } from "@shared/components/search-box/search-box.component";
import { FilterDropdownComponent } from "@shared/components/filter-dropdown/filter-dropdown.component";
import {
  CharacterFilter,
  GENDER_OPTIONS,
  SPECIES_FILTER_OPTIONS,
  STATUS_OPTIONS,
} from "@core/models/rick-and-morty";

@Component({
  selector: "search-toolbar",
  imports: [SearchBoxComponent, FilterDropdownComponent],
  templateUrl: "./search-toolbar.component.html",
  styleUrl: "./search-toolbar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchToolbarComponent {
  totalCount = input<number>(0);

  filterChange = output<CharacterFilter>();

  private currentFilters: CharacterFilter = {};
  searchPattern = /^[a-zA-Z0-9\s-]*$/;
  statusOptions = STATUS_OPTIONS;
  speciesOptions = SPECIES_FILTER_OPTIONS;
  genderOptions = GENDER_OPTIONS;

  onSearchChange(query: string): void {
    this.updateFilter("name", query);
  }

  onStatusChange(value: string): void {
    this.updateFilter("status", value);
  }

  onSpeciesChange(value: string): void {
    this.updateFilter("species", value);
  }

  onGenderChange(value: string): void {
    this.updateFilter("gender", value);
  }

  private updateFilter(key: keyof CharacterFilter, value: string): void {
    this.currentFilters = { ...this.currentFilters, [key]: value || undefined };
    this.filterChange.emit(this.currentFilters);
  }
}
