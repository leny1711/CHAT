export const MAX_REVEAL_LEVEL = 5;

const REVEAL_THRESHOLDS = [0, 5, 10, 15, 20, 25];

export const getRevealLevel = (messageCount: number): number => {
  const safeCount = Math.max(0, messageCount);
  let level = 0;

  for (let index = 0; index < REVEAL_THRESHOLDS.length; index += 1) {
    if (safeCount >= REVEAL_THRESHOLDS[index]) {
      level = index;
    }
  }

  return Math.min(level, MAX_REVEAL_LEVEL);
};
