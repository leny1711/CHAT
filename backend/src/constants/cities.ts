export interface City {
  id: string;
  name: string;
  slug: string;
  country: string;
  latitude: number;
  longitude: number;
  departmentCode: string;
}

export const CITY_OPTIONS: City[] = [
  {
    id: 'fr-toulouse',
    name: 'Toulouse',
    slug: 'toulouse',
    country: 'FR',
    latitude: 43.6047,
    longitude: 1.4442,
    departmentCode: '31',
  },
  {
    id: 'fr-paris',
    name: 'Paris',
    slug: 'paris',
    country: 'FR',
    latitude: 48.8566,
    longitude: 2.3522,
    departmentCode: '75',
  },
  {
    id: 'fr-lyon',
    name: 'Lyon',
    slug: 'lyon',
    country: 'FR',
    latitude: 45.764,
    longitude: 4.8357,
    departmentCode: '69',
  },
  {
    id: 'fr-marseille',
    name: 'Marseille',
    slug: 'marseille',
    country: 'FR',
    latitude: 43.2965,
    longitude: 5.3698,
    departmentCode: '13',
  },
  {
    id: 'fr-bordeaux',
    name: 'Bordeaux',
    slug: 'bordeaux',
    country: 'FR',
    latitude: 44.8378,
    longitude: -0.5792,
    departmentCode: '33',
  },
  {
    id: 'fr-lille',
    name: 'Lille',
    slug: 'lille',
    country: 'FR',
    latitude: 50.6292,
    longitude: 3.0573,
    departmentCode: '59',
  },
];

export const CITY_SLUGS = new Set(CITY_OPTIONS.map(city => city.slug));
export const DEFAULT_CITY_SLUG = 'toulouse';
export const DEFAULT_CITY = CITY_OPTIONS[0];
