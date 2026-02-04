import {useCallback, useEffect, useRef, useState} from 'react';
import {
  MATCH_NOTICE_DURATION_MS,
  MATCH_NOTICE_MESSAGE,
} from '../constants/matchNotice';

export type MatchNoticeTrigger = () => void;

const MIN_MATCH_NOTICE_DURATION_MS = 2000;

export const useMatchNotice = () => {
  const [matchNotice, setMatchNotice] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleUntilRef = useRef<number | null>(null);

  const clearNoticeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleDismiss = useCallback(
    (visibleUntil: number) => {
      clearNoticeTimeout();
      const remaining = visibleUntil - Date.now();
      if (remaining <= 0) {
        if (visibleUntilRef.current === visibleUntil) {
          visibleUntilRef.current = null;
          setMatchNotice(null);
        }
        return;
      }

      timeoutRef.current = setTimeout(() => {
        if (visibleUntilRef.current !== visibleUntil) {
          return;
        }
        scheduleDismiss(visibleUntil);
      }, remaining);
    },
    [clearNoticeTimeout],
  );

  const showMatchNotice = useCallback(() => {
    const duration = Math.max(
      MATCH_NOTICE_DURATION_MS,
      MIN_MATCH_NOTICE_DURATION_MS,
    );
    const visibleUntil = Date.now() + duration;
    visibleUntilRef.current = visibleUntil;
    setMatchNotice(MATCH_NOTICE_MESSAGE);
    scheduleDismiss(visibleUntil);
  }, [scheduleDismiss]);

  useEffect(() => {
    return () => {
      clearNoticeTimeout();
      visibleUntilRef.current = null;
    };
  }, [clearNoticeTimeout]);

  return {matchNotice, showMatchNotice};
};
