import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
  Character,
  CharacterFilter,
  Episode,
  RickAndMortyResponse,
} from "@core/models/rick-and-morty";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RickAndMortyApiService {
  private readonly http = inject(HttpClient);

  private readonly basePath = environment.rickAndMortyApiUrl;

  getCharacters(
    page: number,
    filters?: CharacterFilter,
  ): Observable<RickAndMortyResponse<Character>> {
    let params = new HttpParams().set("page", page);

    if (filters?.name) params = params.set("name", filters.name);
    if (filters?.status) params = params.set("status", filters.status);
    if (filters?.species) params = params.set("species", filters.species);
    if (filters?.gender) params = params.set("gender", filters.gender);

    return this.http.get<RickAndMortyResponse<Character>>(
      `${this.basePath}/character`,
      { params },
    );
  }

  getCharacterById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.basePath}/character/${id}`);
  }

  getEpisodeById(id: number): Observable<Episode> {
    return this.http.get<Episode>(`${this.basePath}/episode/${id}`);
  }
}
