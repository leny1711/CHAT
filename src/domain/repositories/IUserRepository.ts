import { User, Profile } from '../entities/User';

/**
 * Repository interface for user management
 * Defines the contract for data operations related to users
 */
export interface IUserRepository {
  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Get user by ID
   */
  getUserById(userId: string): Promise<User | null>;

  /**
   * Get user profile (public view)
   */
  getProfile(userId: string): Promise<Profile | null>;

  /**
   * Update current user profile
   */
  updateProfile(updates: Partial<User>): Promise<User>;

  /**
   * Create new user account
   */
  createUser(email: string, password: string, userData: Partial<User>): Promise<User>;

  /**
   * Authenticate user
   */
  login(email: string, password: string): Promise<User>;

  /**
   * Logout current user
   */
  logout(): Promise<void>;
}
