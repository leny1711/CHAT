import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {MatchesScreen} from '../MatchesScreen';
import {Match, MatchStatus} from '../../../domain/entities/Match';
import {User} from '../../../domain/entities/User';

const buildMatch = (overrides?: Partial<Match>): Match => ({
  id: 'match_1',
  userIds: ['user_1', 'user_2'] as [string, string],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  conversationId: 'conv_1',
  status: MatchStatus.ACTIVE,
  ...overrides,
});

const buildUser = (overrides?: Partial<User>): User => ({
  id: 'user_2',
  email: 'user2@test.com',
  name: 'Camille',
  age: 28,
  bio: 'Bio',
  photos: [],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  lastActive: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('MatchesScreen', () => {
  it('affiche le nom du match depuis les données du match', async () => {
    const match = buildMatch({otherUser: {id: 'user_2', name: 'Alex'}});
    const onGetMatches = jest.fn().mockResolvedValue([match]);
    const onSelectMatch = jest.fn().mockResolvedValue(undefined);
    const getUserById = jest.fn().mockResolvedValue(null);

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MatchesScreen
          onGetMatches={onGetMatches}
          onSelectMatch={onSelectMatch}
          getUserById={getUserById}
          currentUserId="user_1"
        />,
      );
    });

    expect(tree!.root.findByProps({children: 'Alex'})).toBeTruthy();
  });

  it('affiche le nom du match depuis le profil chargé', async () => {
    const match = buildMatch();
    const onGetMatches = jest.fn().mockResolvedValue([match]);
    const onSelectMatch = jest.fn().mockResolvedValue(undefined);
    const getUserById = jest.fn().mockResolvedValue(buildUser());

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MatchesScreen
          onGetMatches={onGetMatches}
          onSelectMatch={onSelectMatch}
          getUserById={getUserById}
          currentUserId="user_1"
        />,
      );
    });

    expect(tree!.root.findByProps({children: 'Camille'})).toBeTruthy();
  });

  it('utilise le fallback utilisateur si aucun nom disponible', async () => {
    const match = buildMatch();
    const onGetMatches = jest.fn().mockResolvedValue([match]);
    const onSelectMatch = jest.fn().mockResolvedValue(undefined);
    const getUserById = jest.fn().mockResolvedValue(null);

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MatchesScreen
          onGetMatches={onGetMatches}
          onSelectMatch={onSelectMatch}
          getUserById={getUserById}
          currentUserId="user_1"
        />,
      );
    });

    expect(tree!.root.findByProps({children: 'Utilisateur'})).toBeTruthy();
  });
});
