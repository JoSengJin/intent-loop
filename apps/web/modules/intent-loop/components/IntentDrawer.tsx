import { useEffect } from 'react';
import type { Act, IntentState } from '@intent-loop/features/intent-loop/types';
import IntentPane from './IntentPane';

interface IntentDrawerProps {
  s: IntentState;
  act: Act;
  open: boolean;
  onClose: () => void;
}

export default function IntentDrawer({ s, act, open, onClose }: IntentDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <>
      <div className={`drawer-scrim ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`intent-drawer ${open ? 'open' : ''}`} aria-label="가상 intent.md" aria-hidden={!open}>
        <div className="drawer-head">
          <strong>가상 intent.md</strong>
          <span className="badge">개발 기준</span>
          <button className="button ghost small" onClick={onClose}>닫기</button>
        </div>
        <IntentPane s={s} act={act} />
      </aside>
    </>
  );
}
