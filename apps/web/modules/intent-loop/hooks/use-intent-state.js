import { useCallback, useEffect, useState } from 'react';
import { initialState } from '@intent-loop/features/intent-loop/model';

const key = 'intent-loop-prototype-v2';

function readSaved() {
  try { return { ...initialState, ...JSON.parse(localStorage.getItem(key)) }; } catch { return initialState; }
}

export function useIntentState() {
  const [s, setS] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState(false);
  useEffect(() => { setS(readSaved()); setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(key, JSON.stringify(s)); setSaveError(false); } catch { setSaveError(true); }
  }, [s, hydrated]);
  const update = useCallback(patch => setS(old => ({ ...old, ...patch })), []);
  const act = useCallback((transition, ...args) => setS(old => transition(old, ...args)), []);
  return { s, hydrated, saveError, update, act };
}
