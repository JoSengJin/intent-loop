import { steps } from '@intent-loop/features/intent-loop/model';
import type { IntentState } from '@intent-loop/features/intent-loop/types';

interface NavStepProps {
  name: string;
  index: number;
  current: number;
}

function NavStep({ name, index, current }: NavStepProps) {
  const state = current === index + 1 ? 'active' : current > index + 1 ? 'done' : '';
  return (
    <div className={`nav-step ${state}`}>
      <span className="nav-num">{current > index + 1 ? '✓' : index + 1}</span>
      {name}
    </div>
  );
}

export default function Sidebar({ s }: { s: IntentState }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">↗</span>
        <span>intent<span className="brand-light">loop</span><small>의도를 결과로, 확인은 직접</small></span>
      </div>
      <div className="side-caption">현재 작업</div>
      <div className="project-card">
        <span className="project-icon">⌘</span>
        <div>
          <strong>{s.project || '프로젝트 미선택'}</strong>
          <small>{s.project ? '로컬 프로젝트' : '폴더를 선택해 시작하세요'}</small>
        </div>
      </div>
      <div className="side-caption flow-caption">작업 흐름</div>
      <nav aria-label="작업 단계">
        {steps.map((name, i) => <NavStep key={name} name={name} index={i} current={s.step} />)}
      </nav>
      {s.step === 3 && <div className="round-chip">Round {s.round + 1}</div>}
    </aside>
  );
}
