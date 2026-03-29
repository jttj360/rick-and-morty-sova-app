import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./features/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "search",
    loadComponent: () =>
      import("./features/search/search.component").then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: "favorites",
    loadComponent: () =>
      import("./features/favorites/favorites.component").then(
        (m) => m.FavoritesComponent,
      ),
  },
  {
    path: "**",
    loadComponent: () =>
      import("./features/not-found/not-found.component").then(
        (m) => m.NotFoundComponent,
      ),
  },
];
