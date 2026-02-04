import React, {useEffect} from 'react';
import renderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import {useMatchNotice} from '../useMatchNotice';
import {
  MATCH_NOTICE_DURATION_MS,
  MATCH_NOTICE_MESSAGE,
} from '../../constants/matchNotice';

const NoticeHarness = ({
  onReady,
}: {
  onReady: (trigger: () => void) => void;
}) => {
  const {matchNotice, showMatchNotice} = useMatchNotice();

  useEffect(() => {
    onReady(showMatchNotice);
  }, [onReady, showMatchNotice]);

  if (!matchNotice) {
    return null;
  }

  return <Text>{matchNotice}</Text>;
};

describe('useMatchNotice', () => {
  it('maintient la notice pendant au moins 2 secondes', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    const expectedDuration = Math.max(MATCH_NOTICE_DURATION_MS, 2000);
    let trigger: (() => void) | null = null;

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <NoticeHarness onReady={handler => (trigger = handler)} />,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(trigger).not.toBeNull();

    act(() => {
      trigger?.();
    });

    expect(tree!.root.findByType(Text).props.children).toBe(
      MATCH_NOTICE_MESSAGE,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(tree!.root.findAllByType(Text)).toHaveLength(1);

    act(() => {
      trigger?.();
    });

    act(() => {
      jest.advanceTimersByTime(expectedDuration - 1);
    });

    expect(tree!.root.findAllByType(Text)).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(tree!.root.findAllByType(Text)).toHaveLength(0);

    await act(async () => {
      tree!.unmount();
    });
    jest.useRealTimers();
  });
});
