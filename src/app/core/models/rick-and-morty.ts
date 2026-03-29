export const STATUS_OPTIONS = ["Alive", "Dead", "unknown"] as const;
export const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Genderless",
  "Unknown",
] as const;

export type CharacterStatus = (typeof STATUS_OPTIONS)[number];
export type CharacterGender = (typeof GENDER_OPTIONS)[number];

export const SPECIES_FILTER_OPTIONS = [
  "Human",
  "Alien",
  "Humanoid",
  "Poopybutthole",
  "Mythological Creature",
  "Unknown",
] as const;

export interface RickAndMortyResponse<T> {
  info: {
    count: number;
    pages: number;
    next: string;
    prev: string;
  };
  results: T[];
}

export interface Character {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}

export interface CharacterFilter {
  name?: string;
  status?: string;
  species?: string;
  type?: string;
  gender?: string;
}
