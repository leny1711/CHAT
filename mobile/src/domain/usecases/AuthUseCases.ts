import {IUserRepository} from '../repositories/IUserRepository';
import {User} from '../entities/User';

/**
 * Use case for user authentication
 */
export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, password: string): Promise<User> {
    return this.userRepository.login(email, password);
  }
}

/**
 * Use case for user registration
 */
export class RegisterUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    email: string,
    password: string,
    userData: Partial<User>,
  ): Promise<User> {
    return this.userRepository.createUser(email, password, userData);
  }
}

/**
 * Use case for getting current user
 */
export class GetCurrentUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<User | null> {
    return this.userRepository.getCurrentUser();
  }
}

/**
 * Use case for updating user profile
 */
export class UpdateProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(updates: Partial<User>): Promise<User> {
    return this.userRepository.updateProfile(updates);
  }
}

/**
 * Use case for logout
 */
export class LogoutUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<void> {
    return this.userRepository.logout();
  }
}
