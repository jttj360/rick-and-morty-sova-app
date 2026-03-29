import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "skeleton-card",
  imports: [],
  templateUrl: "./skeleton-card.component.html",
  styleUrl: "./skeleton-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonCardComponent {}
