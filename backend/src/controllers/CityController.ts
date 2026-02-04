import { Request, Response } from 'express';
import { CITY_OPTIONS } from '../constants/cities';

const MAX_CITY_SEARCH_RESULTS = 10;

export class CityController {
  async search(req: Request, res: Response): Promise<void> {
    const query = String(req.query.query ?? '').trim().toLowerCase();
    if (!query) {
      res.status(200).json({ cities: [] });
      return;
    }

    const results = CITY_OPTIONS.filter(city =>
      city.name.toLowerCase().includes(query),
    ).slice(0, MAX_CITY_SEARCH_RESULTS);

    res.status(200).json({ cities: results });
  }
}
