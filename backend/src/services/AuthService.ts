import { db } from '../config/database';
import { User, UserResponse, RegisterRequest } from '../types';
import { hashPassword, comparePassword, generateId } from '../utils/crypto';

export class AuthService {
  async register(data: RegisterRequest): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await db.get<User>(
      'SELECT * FROM users WHERE email = $1',
      [data.email]
    );

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const userId = generateId('user_');
    await db.run(
      'INSERT INTO users (id, email, password_hash, name, age, bio, profile_photo, gender, looking_for, city_slug, city_name, city_latitude, city_longitude, city_department_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
      [
        userId,
        data.email,
        passwordHash,
        data.name,
        data.age || null,
        data.bio || '',
        data.profilePhoto || null,
        data.gender,
        data.lookingFor,
        data.citySlug,
        data.cityName,
        data.latitude,
        data.longitude,
        data.departmentCode,
      ],
    );

    // Get created user
    const user = await db.get<User>('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user) throw new Error('Failed to create user');

    return this.toUserResponse(user);
  }

  async login(email: string, password: string): Promise<UserResponse> {
    const user = await db.get<User>('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last active
    await db.run('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    return this.toUserResponse(user);
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await db.get<User>('SELECT * FROM users WHERE id = $1', [userId]);
    return user ? this.toUserResponse(user) : null;
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      bio: user.bio,
      profile_photo: user.profile_photo || null,
      city_slug: user.city_slug,
      city_name: user.city_name ?? null,
      city_latitude: user.city_latitude ?? null,
      city_longitude: user.city_longitude ?? null,
      city_department_code: user.city_department_code ?? null,
      gender: user.gender ?? null,
      looking_for: user.looking_for ?? null,
      created_at: user.created_at,
      last_active: user.last_active,
    };
  }
}
