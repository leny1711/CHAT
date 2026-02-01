/**
 * @format
 */

import 'react-native';
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {LoginScreen} from '../src/presentation/screens/LoginScreen';
import {RegisterScreen} from '../src/presentation/screens/RegisterScreen';
import {User} from '../src/domain/entities/User';
import {UserRepository} from '../src/data/repositories/UserRepository';
import {MatchRepository} from '../src/data/repositories/MatchRepository';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const mockUserRepository = {
  initializeAuth: jest.fn(),
  createUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getUserById: jest.fn(),
};
const mockMatchRepository = {
  getDiscoveryProfiles: jest.fn(),
  likeUser: jest.fn(),
  passUser: jest.fn(),
  getMatches: jest.fn(),
};
const mockMessageRepository = {
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
  subscribeToConversation: jest.fn(),
};

jest.mock('../src/data/repositories/UserRepository', () => ({
  UserRepository: jest.fn(() => mockUserRepository),
}));

jest.mock('../src/data/repositories/MatchRepository', () => ({
  MatchRepository: jest.fn(() => mockMatchRepository),
}));

jest.mock('../src/data/repositories/MessageRepository', () => ({
  MessageRepository: jest.fn(() => mockMessageRepository),
}));

const App = require('../App').default;

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'user_1',
  email: 'test@example.com',
  name: 'Alex',
  bio: 'Description assez longue',
  gender: 'female',
  lookingFor: ['male'],
  photos: [],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  lastActive: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

beforeEach(() => {
  mockUserRepository.initializeAuth.mockReset();
  mockUserRepository.createUser.mockReset();
  mockUserRepository.login.mockReset();
  mockUserRepository.logout.mockReset();
  mockUserRepository.getUserById.mockReset();
  mockUserRepository.initializeAuth.mockResolvedValue(null);
  mockUserRepository.createUser.mockResolvedValue(buildUser());
  mockUserRepository.login.mockResolvedValue(buildUser());
  mockUserRepository.logout.mockResolvedValue(undefined);
  mockUserRepository.getUserById.mockResolvedValue(null);

  mockMatchRepository.getDiscoveryProfiles.mockReset();
  mockMatchRepository.likeUser.mockReset();
  mockMatchRepository.passUser.mockReset();
  mockMatchRepository.getMatches.mockReset();
  mockMatchRepository.getDiscoveryProfiles.mockResolvedValue([]);
  mockMatchRepository.likeUser.mockResolvedValue(undefined);
  mockMatchRepository.passUser.mockResolvedValue(undefined);
  mockMatchRepository.getMatches.mockResolvedValue([]);

  mockMessageRepository.getMessages.mockReset();
  mockMessageRepository.sendMessage.mockReset();
  mockMessageRepository.subscribeToConversation.mockReset();
});

it('renders correctly', async () => {
  await act(async () => {
    renderer.create(
      <SafeAreaProvider>
        <App />
      </SafeAreaProvider>,
    );
  });
});

it('transmet le genre et les préférences via App', async () => {
  const userRepository = mockUserRepository;
  let tree: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <SafeAreaProvider>
        <App />
      </SafeAreaProvider>,
    );
  });

  const loginScreen = tree!.root.findByType(LoginScreen);
  await act(async () => {
    loginScreen.props.onNavigateToRegister();
  });

  const registerScreen = tree!.root.findByType(RegisterScreen);
  await act(async () => {
    await registerScreen.props.onRegister(
      'alex@example.com',
      'password',
      'Alex',
      'Description assez longue',
      'female',
      ['male', 'female'],
      null,
    );
  });

  expect(userRepository.createUser).toHaveBeenCalledWith(
    'alex@example.com',
    'password',
    expect.objectContaining({
      name: 'Alex',
      bio: 'Description assez longue',
      gender: 'female',
      lookingFor: ['male', 'female'],
      profilePhoto: null,
    }),
  );
});
