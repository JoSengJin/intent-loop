import { useCallback, useEffect, useState } from 'react';
import { darkQuery, isModeId, modeStorageKey, resolveMode } from '../lib/modes';
import type { ModeId } from '../lib/modes';

function readStoredMode(): ModeId {
  try {
    const stored = localStorage.getItem(modeStorageKey);
    return isModeId(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function useMode() {
  const [mode, setMode] = useState<ModeId | null>(null);

  useEffect(() => {
    setMode(readStoredMode());
  }, []);

  useEffect(() => {
    if (mode === null) return;
    const media = window.matchMedia(darkQuery);
    const apply = () => {
      document.documentElement.dataset.mode = resolveMode(mode, media.matches);
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [mode]);

  const choose = useCallback((next: ModeId) => {
    setMode(next);
    try { localStorage.setItem(modeStorageKey, next); } catch { /* 저장 공간을 못 쓰면 이번 세션에만 적용 */ }
  }, []);

  return { mode: mode ?? 'system', choose };
}
