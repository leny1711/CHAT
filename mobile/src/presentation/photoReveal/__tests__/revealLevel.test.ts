import {getRevealLevel, REVEAL_THRESHOLDS} from '../index';

describe('getRevealLevel', () => {
  it('returns 0 below first threshold', () => {
    expect(getRevealLevel(0)).toBe(0);
    expect(getRevealLevel(REVEAL_THRESHOLDS.level1 - 1)).toBe(0);
  });

  it('returns levels at exact thresholds', () => {
    expect(getRevealLevel(REVEAL_THRESHOLDS.level1)).toBe(1);
    expect(getRevealLevel(REVEAL_THRESHOLDS.level2)).toBe(2);
    expect(getRevealLevel(REVEAL_THRESHOLDS.level3)).toBe(3);
    expect(getRevealLevel(REVEAL_THRESHOLDS.level4)).toBe(4);
    expect(getRevealLevel(REVEAL_THRESHOLDS.level5)).toBe(5);
  });

  it('caps at max level beyond highest threshold', () => {
    expect(getRevealLevel(REVEAL_THRESHOLDS.level5 + 10)).toBe(5);
  });
});
