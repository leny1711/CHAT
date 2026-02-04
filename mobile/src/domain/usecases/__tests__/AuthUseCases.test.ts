import {RegisterUseCase} from '../AuthUseCases';
import {IUserRepository} from '../../repositories/IUserRepository';
import {User} from '../../entities/User';

// Mock repository
class MockUserRepository implements IUserRepository {
  private shouldTimeout = false;
  private shouldNetworkError = false;
  private shouldDuplicateError = false;

  async getCurrentUser(): Promise<User | null> {
    return null;
  }

  async getUserById(_userId: string): Promise<User | null> {
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    return [];
  }

  async getProfile(_userId: string) {
    return null;
  }

  async updateProfile(_updates: Partial<User>): Promise<User> {
    throw new Error('Not implemented');
  }

  async createUser(
    email: string,
    _password: string,
    userData: Partial<User>,
  ): Promise<User> {
    // Simulate timeout error
    if (this.shouldTimeout) {
      throw new Error('Request timeout');
    }

    // Simulate network error
    if (this.shouldNetworkError) {
      throw new Error('Network error');
    }

    // Simulate duplicate email error
    if (this.shouldDuplicateError) {
      throw new Error('Email already exists');
    }

    // Success case
    return {
      id: 'test_user_id',
      email,
      name: userData.name || 'Test User',
      age: userData.age || 25,
      bio: userData.bio || 'Test bio',
      citySlug: userData.citySlug || 'toulouse',
      gender: userData.gender ?? 'male',
      lookingFor: userData.lookingFor ?? [],
      profilePhoto: userData.profilePhoto,
      photos: [],
      createdAt: new Date(),
      lastActive: new Date(),
    };
  }

  async login(_email: string, _password: string): Promise<User> {
    throw new Error('Not implemented');
  }

  async logout(): Promise<void> {
    // No-op
  }

  // Test helpers
  setTimeoutError(value: boolean) {
    this.shouldTimeout = value;
  }

  setNetworkError(value: boolean) {
    this.shouldNetworkError = value;
  }

  setDuplicateError(value: boolean) {
    this.shouldDuplicateError = value;
  }
}

describe('AuthUseCases', () => {
  describe('RegisterUseCase', () => {
    it('should register a user successfully', async () => {
      const mockRepo = new MockUserRepository();
      const useCase = new RegisterUseCase(mockRepo);
      const profilePhoto = {uri: 'file://photo.jpg'};

      const user = await useCase.execute('test@example.com', 'password123', {
        name: 'John Doe',
        bio: 'Test bio for user',
        gender: 'male',
        lookingFor: ['female'],
        profilePhoto,
      });

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.bio).toBe('Test bio for user');
      expect(user.gender).toBe('male');
      expect(user.lookingFor).toEqual(['female']);
      expect(user.profilePhoto).toEqual(profilePhoto);
    });

    it('should throw timeout error when request times out', async () => {
      const mockRepo = new MockUserRepository();
      mockRepo.setTimeoutError(true);
      const useCase = new RegisterUseCase(mockRepo);

      await expect(
        useCase.execute('test@example.com', 'password123', {
          name: 'John Doe',
          bio: 'Test bio',
        }),
      ).rejects.toThrow('Request timeout');
    });

    it('should throw network error when network fails', async () => {
      const mockRepo = new MockUserRepository();
      mockRepo.setNetworkError(true);
      const useCase = new RegisterUseCase(mockRepo);

      await expect(
        useCase.execute('test@example.com', 'password123', {
          name: 'John Doe',
          bio: 'Test bio',
        }),
      ).rejects.toThrow('Network error');
    });

    it('should throw duplicate error when email already exists', async () => {
      const mockRepo = new MockUserRepository();
      mockRepo.setDuplicateError(true);
      const useCase = new RegisterUseCase(mockRepo);

      await expect(
        useCase.execute('test@example.com', 'password123', {
          name: 'John Doe',
          bio: 'Test bio',
        }),
      ).rejects.toThrow('Email already exists');
    });
  });
});
