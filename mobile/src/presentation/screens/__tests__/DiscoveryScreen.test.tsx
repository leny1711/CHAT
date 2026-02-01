import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Animated, Text, TouchableOpacity} from 'react-native';
import {DiscoveryScreen} from '../DiscoveryScreen';
import {SimpleDiscoveryScreen} from '../SimpleDiscoveryScreen';
import {
  DiscoveryProfile,
  Match,
  MatchStatus,
} from '../../../domain/entities/Match';

const buildProfile = (
  overrides?: Partial<DiscoveryProfile>,
): DiscoveryProfile => ({
  userId: 'user_1',
  name: 'Camille',
  bio: 'Bio',
  ...overrides,
});

const buildMatch = (overrides?: Partial<Match>): Match => ({
  id: 'match_1',
  userIds: ['user_1', 'user_2'],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  status: MatchStatus.ACTIVE,
  ...overrides,
});

describe('DiscoveryScreen', () => {
  it('affiche la notice de match en surcouche après un like', async () => {
    jest.useFakeTimers();
    const timingSpy = jest.spyOn(Animated, 'timing').mockReturnValue({
      start: callback => callback?.({finished: true}),
    } as unknown as Animated.CompositeAnimation);
    const onLike = jest.fn().mockResolvedValue(buildMatch());
    const onPass = jest.fn().mockResolvedValue(undefined);
    const getProfiles = jest.fn().mockResolvedValue([buildProfile()]);

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <DiscoveryScreen
          onLike={onLike}
          onPass={onPass}
          getProfiles={getProfiles}
        />,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    const likeButton = tree!.root
      .findAllByType(TouchableOpacity)
      .find(button =>
        button
          .findAllByType(Text)
          .some(node => node.props.children === "J'aime"),
      );

    await act(async () => {
      await likeButton?.props.onPress();
    });

    expect(
      tree!.root.findByProps({
        children: '🎉 C’est un match 🎉 Une nouvelle histoire commence.',
      }),
    ).toBeTruthy();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    await act(async () => {
      tree!.unmount();
    });
    timingSpy.mockRestore();
    jest.useRealTimers();
  });

  it('maintient la notice de match pendant un rafraichissement simple', async () => {
    jest.useFakeTimers();
    const onLike = jest.fn().mockResolvedValue(buildMatch());
    const onPass = jest.fn().mockResolvedValue(undefined);
    const getProfiles = jest
      .fn()
      .mockResolvedValueOnce([buildProfile()])
      .mockResolvedValueOnce([]);

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <SimpleDiscoveryScreen
          onLike={onLike}
          onPass={onPass}
          getProfiles={getProfiles}
        />,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    const likeButton = tree!.root
      .findAllByType(TouchableOpacity)
      .find(button =>
        button
          .findAllByType(Text)
          .some(node => node.props.children === "J'aime"),
      );

    await act(async () => {
      await likeButton?.props.onPress();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(getProfiles).toHaveBeenCalledTimes(2);
    expect(
      tree!.root.findByProps({
        children: '🎉 C’est un match 🎉 Une nouvelle histoire commence.',
      }),
    ).toBeTruthy();
    expect(
      tree!.root.findByProps({
        children: 'Plus de profils',
      }),
    ).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(
      tree!.root.findByProps({
        children: '🎉 C’est un match 🎉 Une nouvelle histoire commence.',
      }),
    ).toBeTruthy();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    await act(async () => {
      tree!.unmount();
    });
    jest.useRealTimers();
  });
});
