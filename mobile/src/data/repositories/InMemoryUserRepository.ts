import {User, Profile} from '../../domain/entities/User';
import {IUserRepository} from '../../domain/repositories/IUserRepository';

/**
 * Simple in-memory user repository
 * No persistence - state is kept in memory only
 */
export class InMemoryUserRepository implements IUserRepository {
  private currentUser: User | null = null;
  private users: Map<string, User> = new Map();
  private nextUserId = 1;

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      name: user.name,
      age: user.age,
      bio: user.bio,
      photos: user.photos,
      revealProgress: {
        photosRevealed: 0,
        totalPhotos: 0,
        messagesSent: 0,
        messagesRequired: 10,
      },
    };
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    this.currentUser = {...this.currentUser, ...updates};
    this.users.set(this.currentUser.id, this.currentUser);
    return this.currentUser;
  }

  async createUser(
    email: string,
    password: string,
    userData: Partial<User>,
  ): Promise<User> {
    const userId = `user_${this.nextUserId++}`;
    const now = new Date();

    const user: User = {
      id: userId,
      email,
      name: userData.name || 'User',
      bio: userData.bio || '',
      photos: [],
      createdAt: now,
      lastActive: now,
    };

    this.users.set(userId, user);
    this.currentUser = user;

    return user;
  }

  async login(_email: string, _password: string): Promise<User> {
    // Simple in-memory login - find user by email
    const user = Array.from(this.users.values()).find(u => u.email === _email);

    if (!user) {
      throw new Error('User not found');
    }

    this.currentUser = user;
    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }
}
