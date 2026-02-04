import { Request, Response } from 'express';
import path from 'path';
import { AuthService } from '../services/AuthService';
import { CITY_SLUGS, CITY_BY_SLUG } from '../constants/cities';
import { generateToken } from '../middleware/auth';
import { AuthRequest, RegisterRequest, RegisterFormData } from '../types';

// Accept minor rounding from client-side float formatting (~7-11 meters precision).
const COORDINATE_TOLERANCE = 0.0001;
const coordinatesMatch = (expected: number, received: number) =>
  Number.isFinite(received) &&
  Math.abs(expected - received) < COORDINATE_TOLERANCE;

const authService = new AuthService();

export class AuthController {
  async register(
    req: Request & { file?: Express.Multer.File },
    res: Response,
  ): Promise<void> {
    try {
      const body = req.body as RegisterFormData;
      const parsedAge =
        body.age !== undefined && body.age !== null
          ? Number(body.age)
          : undefined;
      const lookingForInput = body.lookingFor ?? (body as { looking_for?: string | string[] }).looking_for;
      const lookingFor = Array.isArray(lookingForInput)
        ? lookingForInput
        : typeof lookingForInput === 'string'
          ? lookingForInput.split(',').map(value => value.trim()).filter(Boolean)
          : [];
      const gender =
        body.gender === 'male' || body.gender === 'female' ? body.gender : undefined;
      const filteredLookingFor = lookingFor.filter(
        value => value === 'male' || value === 'female',
      ) as Array<'male' | 'female'>;
      const citySlug = (body.citySlug || '').toLowerCase().trim();
      const cityName = (body.cityName || '').trim();
      const departmentCode = (body.departmentCode || '').trim();
      const parseNumber = (value?: string | number): number => {
        if (value === undefined || value === null || value === '') {
          return NaN;
        }
        return Number(value);
      };
      const latitude = parseNumber(body.latitude);
      const longitude = parseNumber(body.longitude);

      const email = body.email || '';
      const password = body.password || '';
      const name = body.name || '';

      // Validate input
      if (!email || !password || !name) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      if (!gender || filteredLookingFor.length === 0) {
        res.status(400).json({ error: 'Missing gender or preferences' });
        return;
      }
      if (
        !citySlug ||
        !CITY_SLUGS.has(citySlug) ||
        !cityName ||
        !departmentCode ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        res.status(400).json({ error: 'Missing or invalid city' });
        return;
      }
      const cityRecord = CITY_BY_SLUG.get(citySlug);
      const normalizedCityName = cityName.toLowerCase();
      const normalizedDepartment = departmentCode.toLowerCase();
      if (
        !cityRecord ||
        cityRecord.name.toLowerCase() !== normalizedCityName ||
        cityRecord.departmentCode.toLowerCase() !== normalizedDepartment ||
        !coordinatesMatch(cityRecord.latitude, latitude) ||
        !coordinatesMatch(cityRecord.longitude, longitude)
      ) {
        res.status(400).json({ error: 'Missing or invalid city' });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: 'Profile photo is required' });
        return;
      }

      const data: RegisterRequest = {
        email,
        password,
        name,
        age: Number.isFinite(parsedAge) ? parsedAge : undefined,
        bio: body.bio,
        gender,
        lookingFor: filteredLookingFor,
        citySlug,
        cityName: cityRecord.name,
        latitude: cityRecord.latitude,
        longitude: cityRecord.longitude,
        departmentCode: cityRecord.departmentCode,
        profilePhoto: `${req.protocol}://${req.get('host')}${path.posix.join(
          '/uploads/profile-photos',
          req.file.filename,
        )}`,
      };

      const user = await authService.register(data);
      const token = generateToken(user.id);

      res.status(201).json({ token, user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({ error: message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: AuthRequest = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Missing email or password' });
        return;
      }

      const user = await authService.login(email, password);
      const token = generateToken(user.id);

      res.status(200).json({ token, user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ error: message });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const user = await authService.getUserById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
}
