import { db } from '../config/database';
import { User, UserResponse, RegisterRequest } from '../types';
import { hashPassword, comparePassword, generateId } from '../utils/crypto';

export class AuthService {
  async register(data: RegisterRequest): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await db.get<User>(
      'SELECT * FROM users WHERE email = ?',
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
      'INSERT INTO users (id, email, password_hash, name, age, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, data.email, passwordHash, data.name, data.age || null, data.bio || '']
    );

    // Get created user
    const user = await db.get<User>('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) throw new Error('Failed to create user');

    return this.toUserResponse(user);
  }

  async login(email: string, password: string): Promise<UserResponse> {
    const user = await db.get<User>('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last active
    await db.run('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    return this.toUserResponse(user);
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await db.get<User>('SELECT * FROM users WHERE id = ?', [userId]);
    return user ? this.toUserResponse(user) : null;
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      bio: user.bio,
      created_at: user.created_at,
      last_active: user.last_active,
    };
  }
}
