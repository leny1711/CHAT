import {MAX_REVEAL_LEVEL, REVEAL_THRESHOLDS} from './config';

const LEVELS = [
  REVEAL_THRESHOLDS.level1,
  REVEAL_THRESHOLDS.level2,
  REVEAL_THRESHOLDS.level3,
  REVEAL_THRESHOLDS.level4,
  REVEAL_THRESHOLDS.level5,
];

export const getRevealLevel = (messageCount: number): number => {
  const safeCount = Math.max(0, messageCount);
  let level = 0;

  for (let index = 0; index < LEVELS.length; index += 1) {
    if (safeCount >= LEVELS[index]) {
      level = index + 1;
    }
  }

  return Math.min(level, MAX_REVEAL_LEVEL);
};

export {MAX_REVEAL_LEVEL, REVEAL_THRESHOLDS};
