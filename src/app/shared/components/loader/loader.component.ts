import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "loader",
  imports: [],
  templateUrl: "./loader.component.html",
  styleUrl: "./loader.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  size = input<"sm" | "md" | "lg">("md");
  ariaLabel = input<string>("Loading");
}
