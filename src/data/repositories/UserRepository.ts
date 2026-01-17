import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Profile } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

/**
 * Mock implementation of User Repository
 * In production, this would connect to a real backend API
 */
export class UserRepository implements IUserRepository {
  private readonly CURRENT_USER_KEY = '@current_user';
  private readonly USERS_KEY = '@users';

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const usersData = await AsyncStorage.getItem(this.USERS_KEY);
      const users: User[] = usersData ? JSON.parse(usersData) : [];
      return users.find(u => u.id === userId) || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    return {
      userId: user.id,
      name: user.name,
      age: user.age,
      bio: user.bio,
      photos: user.photos,
      revealProgress: {
        photosRevealed: user.photos.filter(p => p.isRevealed).length,
        totalPhotos: user.photos.length,
        messagesSent: 0,
        messagesRequired: 10,
      },
    };
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const updatedUser = { ...currentUser, ...updates };
    await AsyncStorage.setItem(
      this.CURRENT_USER_KEY,
      JSON.stringify(updatedUser)
    );

    // Update in users list
    const usersData = await AsyncStorage.getItem(this.USERS_KEY);
    const users: User[] = usersData ? JSON.parse(usersData) : [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex >= 0) {
      users[userIndex] = updatedUser;
      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    return updatedUser;
  }

  async createUser(
    email: string,
    password: string,
    userData: Partial<User>
  ): Promise<User> {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: userData.name || '',
      age: userData.age || 18,
      bio: userData.bio || '',
      photos: userData.photos || [],
      createdAt: new Date(),
      lastActive: new Date(),
    };

    // Save to users list
    const usersData = await AsyncStorage.getItem(this.USERS_KEY);
    const users: User[] = usersData ? JSON.parse(usersData) : [];
    users.push(newUser);
    await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // Set as current user
    await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

    return newUser;
  }

  async login(email: string, password: string): Promise<User> {
    // Mock authentication - in production, verify with backend
    const usersData = await AsyncStorage.getItem(this.USERS_KEY);
    const users: User[] = usersData ? JSON.parse(usersData) : [];
    
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
  }
}
