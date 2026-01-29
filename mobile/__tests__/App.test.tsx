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

jest.mock('../src/data/repositories/UserRepository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    initializeAuth: jest.fn(),
    createUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getUserById: jest.fn(),
  })),
}));

jest.mock('../src/data/repositories/MatchRepository', () => ({
  MatchRepository: jest.fn().mockImplementation(() => ({
    getDiscoveryProfiles: jest.fn(),
    likeUser: jest.fn(),
    passUser: jest.fn(),
    getMatches: jest.fn(),
  })),
}));

jest.mock('../src/data/repositories/MessageRepository', () => ({
  MessageRepository: jest.fn().mockImplementation(() => ({
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    subscribeToConversation: jest.fn(),
  })),
}));

import App from '../App';

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

const getOrCreateUserRepository = () => {
  const existing = (UserRepository as jest.Mock).mock.instances[0];
  return existing ?? new (UserRepository as jest.Mock)();
};

const getOrCreateMatchRepository = () => {
  const existing = (MatchRepository as jest.Mock).mock.instances[0];
  return existing ?? new (MatchRepository as jest.Mock)();
};

beforeEach(() => {
  const userRepository = getOrCreateUserRepository();
  userRepository.initializeAuth.mockReset();
  userRepository.createUser.mockReset();
  userRepository.login.mockReset();
  userRepository.logout.mockReset();
  userRepository.getUserById.mockReset();
  userRepository.initializeAuth.mockResolvedValue(null);
  userRepository.createUser.mockResolvedValue(buildUser());
  userRepository.login.mockResolvedValue(buildUser());
  userRepository.logout.mockResolvedValue(undefined);
  userRepository.getUserById.mockResolvedValue(null);

  const matchRepository = getOrCreateMatchRepository();
  matchRepository.getDiscoveryProfiles.mockReset();
  matchRepository.likeUser.mockReset();
  matchRepository.passUser.mockReset();
  matchRepository.getMatches.mockReset();
  matchRepository.getDiscoveryProfiles.mockResolvedValue([]);
  matchRepository.likeUser.mockResolvedValue(undefined);
  matchRepository.passUser.mockResolvedValue(undefined);
  matchRepository.getMatches.mockResolvedValue([]);
});

it('renders correctly', async () => {
  await act(async () => {
    renderer.create(<App />);
  });
});

it('transmet le genre et les préférences via App', async () => {
  const userRepository = getOrCreateUserRepository();
  let tree: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(<App />);
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
