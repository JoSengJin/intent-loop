import { useCallback, useEffect, useState } from 'react';
import { initialState } from '@intent-loop/features/intent-loop/model';
import type { Act, IntentState, Update } from '@intent-loop/features/intent-loop/types';

const key = 'intent-loop-prototype-v2';

function readSaved(): IntentState {
  try { return { ...initialState, ...JSON.parse(localStorage.getItem(key) ?? 'null') }; } catch { return initialState; }
}

export function useIntentState() {
  const [s, setS] = useState<IntentState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState(false);
  useEffect(() => { setS(readSaved()); setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(key, JSON.stringify(s)); setSaveError(false); } catch { setSaveError(true); }
  }, [s, hydrated]);
  const update: Update = useCallback(patch => setS(old => ({ ...old, ...patch })), []);
  const act: Act = useCallback((transition, ...args) => setS(old => transition(old, ...args)), []);
  return { s, setS, hydrated, saveError, update, act };
}
