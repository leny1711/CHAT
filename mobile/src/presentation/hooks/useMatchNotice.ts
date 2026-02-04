import {useCallback, useEffect, useRef, useState} from 'react';
import {
  MATCH_NOTICE_DURATION_MS,
  MATCH_NOTICE_MESSAGE,
} from '../constants/matchNotice';

export type MatchNoticeTrigger = () => void;

export const useMatchNotice = () => {
  const [matchNotice, setMatchNotice] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMatchNotice = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMatchNotice(MATCH_NOTICE_MESSAGE);
    timeoutRef.current = setTimeout(() => {
      setMatchNotice(null);
    }, MATCH_NOTICE_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {matchNotice, showMatchNotice};
};
