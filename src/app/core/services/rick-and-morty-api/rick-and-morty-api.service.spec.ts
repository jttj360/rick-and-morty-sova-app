import { TestBed } from "@angular/core/testing";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { RickAndMortyApiService } from "./rick-and-morty-api.service";
import {
  mockCharacter,
  mockCharactersResponse,
  mockEpisode,
} from "@testing/mocks/character.mock";
import { environment } from "../../../../environments/environment";

describe("RickAndMortyApiService", () => {
  let service: RickAndMortyApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.rickAndMortyApiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RickAndMortyApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe("getCharacters", () => {
    it("should fetch characters with page parameter", (done) => {
      service.getCharacters(1).subscribe((response) => {
        expect(response).toEqual(mockCharactersResponse);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/character?page=1`);
      expect(req.request.method).toBe("GET");
      req.flush(mockCharactersResponse);
    });

    it("should apply name filter", (done) => {
      service.getCharacters(1, { name: "Rick" }).subscribe((response) => {
        expect(response).toEqual(mockCharactersResponse);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/character?page=1&name=Rick`);
      expect(req.request.method).toBe("GET");
      req.flush(mockCharactersResponse);
    });

    it("should apply all filters", (done) => {
      const filters = {
        name: "Rick",
        status: "Alive",
        species: "Human",
        gender: "Male",
      };

      service.getCharacters(1, filters).subscribe((response) => {
        expect(response).toEqual(mockCharactersResponse);
        done();
      });

      const req = httpMock.expectOne(
        `${baseUrl}/character?page=1&name=Rick&status=Alive&species=Human&gender=Male`,
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockCharactersResponse);
    });

    it("should not include empty filter values", (done) => {
      service
        .getCharacters(1, { name: "", status: "Alive" })
        .subscribe((response) => {
          expect(response).toEqual(mockCharactersResponse);
          done();
        });

      const req = httpMock.expectOne(
        `${baseUrl}/character?page=1&status=Alive`,
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockCharactersResponse);
    });
  });

  it("should fetch a single character by id", (done) => {
    service.getCharacterById("1").subscribe((character) => {
      expect(character).toEqual(mockCharacter);
      done();
    });

    const req = httpMock.expectOne(`${baseUrl}/character/1`);
    expect(req.request.method).toBe("GET");
    req.flush(mockCharacter);
  });

  it("should fetch an episode by id", (done) => {
    service.getEpisodeById("1").subscribe((episode) => {
      expect(episode).toEqual(mockEpisode);
      done();
    });

    const req = httpMock.expectOne(`${baseUrl}/episode/1`);
    expect(req.request.method).toBe("GET");
    req.flush(mockEpisode);
  });
});
