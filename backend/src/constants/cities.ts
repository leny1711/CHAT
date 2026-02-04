export interface City {
  id: string;
  name: string;
  slug: string;
  country: string;
}

export const CITY_OPTIONS: City[] = [
  { id: 'fr-toulouse', name: 'Toulouse', slug: 'toulouse', country: 'FR' },
  { id: 'fr-paris', name: 'Paris', slug: 'paris', country: 'FR' },
  { id: 'fr-lyon', name: 'Lyon', slug: 'lyon', country: 'FR' },
  { id: 'fr-marseille', name: 'Marseille', slug: 'marseille', country: 'FR' },
  { id: 'fr-bordeaux', name: 'Bordeaux', slug: 'bordeaux', country: 'FR' },
  { id: 'fr-lille', name: 'Lille', slug: 'lille', country: 'FR' },
];

export const CITY_SLUGS = new Set(CITY_OPTIONS.map(city => city.slug));
