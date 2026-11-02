import { useEffect } from 'react';
import type { IntentState, Update } from '@intent-loop/features/intent-loop/types';

function useTimer(active: boolean, ms: number, onDone: () => void) {
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(onDone, ms);
    return () => clearTimeout(timer);
  }, [active]);
}

// 목 데이터: 개발이 끝나면 앱 미리보기를 자동으로 준비한다.
export function useRunSimulation(s: IntentState, update: Update, hydrated: boolean) {
  const inWorkbench = hydrated && s.step === 3;
  useTimer(inWorkbench && s.run === 'running', 1700, () => update({ run: 'done', preview: 'running' }));
  useTimer(inWorkbench && s.run === 'done' && s.preview === 'running', 1400, () => update({ preview: 'ready' }));
}
