export interface CityOption {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  departmentCode: string;
}

export const DEFAULT_CITY_SLUG = 'toulouse';

export const normalizeCityName = (value: string): string =>
  value.trim().replace(/\s+/g, ' ');

export const normalizeCitySlug = (value: string): string =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
