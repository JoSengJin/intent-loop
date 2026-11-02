import { useCallback, useEffect, useState } from 'react';
import { isThemeId, themeStorageKey } from '../lib/themes';
import type { ThemeId } from '../lib/themes';

function readStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(themeStorageKey);
    return isThemeId(stored) ? stored : 'lime';
  } catch {
    return 'lime';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>('lime');
  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    document.documentElement.dataset.theme = stored;
  }, []);
  const choose = useCallback((next: ThemeId) => {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(themeStorageKey, next); } catch { /* 저장 공간을 못 쓰면 이번 세션에만 적용 */ }
  }, []);
  return { theme, choose };
}
