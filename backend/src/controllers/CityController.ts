import { Request, Response } from 'express';
import {
  CityOption,
  normalizeCityName,
  normalizeCitySlug,
} from '../constants/cities';

const BAN_API_BASE_URL = 'https://api-adresse.data.gouv.fr/search/';
const MAX_CITY_SEARCH_RESULTS = 10;

interface BanFeature {
  properties?: {
    label?: string;
    city?: string;
    citycode?: string;
    postcode?: string;
    context?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
}

interface BanResponse {
  features?: BanFeature[];
}

const DEPARTMENT_CODE_PATTERN = /^\d{2,3}[A-B]?$/i;


const extractDepartmentFromContext = (context?: string): string | undefined =>
  context
    ?.split(',')
    .map(value => value.trim())
    .find(value => DEPARTMENT_CODE_PATTERN.test(value));

const extractDepartmentFromPostcode = (
  postcode?: string,
): string | undefined => {
  if (!postcode) {
    return undefined;
  }
  const cleaned = postcode.trim();
  if (!cleaned) {
    return undefined;
  }
  if (cleaned.startsWith('97')) {
    return cleaned.slice(0, 3);
  }
  return cleaned.slice(0, 2);
};

const buildCityOption = (feature: BanFeature): CityOption | null => {
  const city = normalizeCityName(feature.properties?.city || '');
  const departmentCode =
    extractDepartmentFromContext(feature.properties?.context) ||
    extractDepartmentFromPostcode(feature.properties?.postcode);
  const coordinates = feature.geometry?.coordinates;
  if (
    !city ||
    !departmentCode ||
    !coordinates ||
    coordinates.length < 2 ||
    !Number.isFinite(coordinates[0]) ||
    !Number.isFinite(coordinates[1])
  ) {
    return null;
  }
  const longitude = coordinates[0];
  const latitude = coordinates[1];
  const slug = normalizeCitySlug(`${city}-${departmentCode}`);

  return {
    id: `fr-${feature.properties?.citycode || slug}`,
    name: city,
    slug,
    latitude,
    longitude,
    departmentCode,
  };
};

const toBanUrl = (query: string) => {
  const params = new URLSearchParams({
    q: query,
    autocomplete: '1',
    limit: String(MAX_CITY_SEARCH_RESULTS),
    type: 'municipality',
  });
  return `${BAN_API_BASE_URL}?${params.toString()}`;
};

export class CityController {
  async search(req: Request, res: Response): Promise<void> {
    const query = String(req.query.query ?? '').trim();
    if (!query) {
      res.status(200).json({ cities: [] });
      return;
    }

    try {
      const response = await fetch(toBanUrl(query));
      if (!response.ok) {
        res.status(502).json({ cities: [] });
        return;
      }
      const data = (await response.json()) as BanResponse;
      const options =
        data.features
          ?.map(feature => buildCityOption(feature))
          .filter((option): option is CityOption => Boolean(option)) ?? [];
      res.status(200).json({ cities: options.slice(0, MAX_CITY_SEARCH_RESULTS) });
    } catch (error) {
      console.warn('BAN city search failed:', error);
      res.status(502).json({ cities: [] });
    }
  }
}
