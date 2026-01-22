import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, Profile, ProfilePhotoAsset} from '../../domain/entities/User';
import {IUserRepository} from '../../domain/repositories/IUserRepository';
import {apiClient} from '../../infrastructure/api/client';
import {wsClient} from '../../infrastructure/api/websocket';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    age: number;
    bio: string;
    profile_photo?: string | null;
    created_at: string;
    last_active: string;
  };
}

/**
 * User Repository with real backend API integration
 */
export class UserRepository implements IUserRepository {
  private readonly TOKEN_KEY = '@auth_token';
  private readonly CURRENT_USER_KEY = '@current_user';
  private readonly DEFAULT_AGE = 25;
  private readonly FALLBACK_AGE = 0;

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.CURRENT_USER_KEY);
      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData);

      // Convert date strings to Date objects
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        lastActive: new Date(user.lastActive),
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      // For now, return current user if IDs match
      // In a full implementation, fetch from API
      const currentUser = await this.getCurrentUser();
      if (currentUser?.id === userId) {
        return currentUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
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
      profilePhotoUrl: user.profilePhotoUrl,
      photos: user.photos,
      revealProgress: {
        photosRevealed: user.photos.filter(photo => photo.isRevealed).length,
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

    const updatedUser = {...currentUser, ...updates};
    await AsyncStorage.setItem(
      this.CURRENT_USER_KEY,
      JSON.stringify(updatedUser),
    );

    return updatedUser;
  }

  async createUser(
    email: string,
    password: string,
    userData: Partial<User>,
  ): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('name', userData.name || '');
      formData.append('age', String(userData.age || this.DEFAULT_AGE));
      formData.append('bio', userData.bio || '');

      const photoAsset = userData.profilePhoto as ProfilePhotoAsset | undefined;
      if (photoAsset?.uri) {
        formData.append('profilePhoto', {
          uri: photoAsset.uri,
          type: photoAsset.type || 'image/jpeg',
          name: photoAsset.fileName || 'photo.jpg',
        } as unknown as Blob);
      }

      const response = await apiClient.postForm<AuthResponse>(
        '/api/auth/register',
        formData,
      );

      // Save token
      await AsyncStorage.setItem(this.TOKEN_KEY, response.token);
      apiClient.setToken(response.token);

      // Convert API response to User entity
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        age: response.user.age || this.FALLBACK_AGE,
        bio: response.user.bio,
        profilePhotoUrl: response.user.profile_photo ?? undefined,
        profilePhoto: undefined,
        photos: [],
        createdAt: new Date(response.user.created_at),
        lastActive: new Date(response.user.last_active),
      };

      // Save user locally
      await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

      // Connect WebSocket
      wsClient.connect(response.token);

      return user;
    } catch (error) {
      // Log error for debugging purposes
      console.error('Registration error:', error);

      // Preserve and re-throw the original error for proper error handling
      if (error instanceof Error) {
        throw error;
      }

      // Wrap non-Error objects in an Error
      throw new Error('Registration failed');
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      });

      // Save token
      await AsyncStorage.setItem(this.TOKEN_KEY, response.token);
      apiClient.setToken(response.token);

      // Convert API response to User entity
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        age: response.user.age || this.FALLBACK_AGE,
        bio: response.user.bio,
        profilePhotoUrl: response.user.profile_photo ?? undefined,
        photos: [],
        createdAt: new Date(response.user.created_at),
        lastActive: new Date(response.user.last_active),
      };

      // Save user locally
      await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

      // Connect WebSocket
      wsClient.connect(response.token);

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
    await AsyncStorage.removeItem(this.TOKEN_KEY);
    apiClient.setToken(null);
    wsClient.disconnect();
  }

  /**
   * Initialize authentication from stored token
   */
  async initializeAuth(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      if (!token) {
        return null;
      }

      apiClient.setToken(token);

      // Verify token by fetching current user
      interface MeResponse {
        user: {
          id: string;
          email: string;
          name: string;
          age: number;
          bio: string;
          profile_photo?: string | null;
          created_at: string;
          last_active: string;
        };
      }

      const response = await apiClient.get<MeResponse>('/api/auth/me');

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        age: response.user.age || this.FALLBACK_AGE,
        bio: response.user.bio,
        profilePhotoUrl: response.user.profile_photo ?? undefined,
        photos: [],
        createdAt: new Date(response.user.created_at),
        lastActive: new Date(response.user.last_active),
      };

      await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

      // Connect WebSocket
      wsClient.connect(token);

      return user;
    } catch (error) {
      // Clear invalid token and auth data
      // This handles cases where:
      // - User was deleted from backend
      // - Token is expired or invalid
      // - Database was reset
      // These are expected scenarios and not errors
      await this.logout();
      return null;
    }
  }
}
