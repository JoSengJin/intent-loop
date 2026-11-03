import { useState } from 'react';
import { counts, workPhase } from '@intent-loop/features/intent-loop/model';
import type { WorkPhase } from '@intent-loop/features/intent-loop/types';
import ChatPane from './ChatPane';
import CriteriaPanel from './CriteriaPanel';
import IntentDrawer from './IntentDrawer';
import PreviewPane from './PreviewPane';
import type { ViewProps } from './types';
import type { IntentState, Update } from '@intent-loop/features/intent-loop/types';

const phaseLabels: Record<WorkPhase, string> = { building: '개발 중', preparing: '앱 준비 중', review: '검토 대기', 'run-error': '작업 중단', 'preview-error': '앱 실행 실패' };

interface WorkbenchBarProps {
  s: IntentState;
  phase: WorkPhase;
  update: Update;
  onIntent: () => void;
}

function WorkbenchBar({ s, phase, update, onIntent }: WorkbenchBarProps) {
  return (
    <div className="wb-bar">
      <div className="wb-title">
        <span className="badge">Round {s.round + 1}</span>
        <strong>{phaseLabels[phase]}</strong>
      </div>
      <div className="wb-actions">
        <button className="button small" onClick={onIntent}>intent.md 보기</button>
        <button className="button primary small" onClick={() => update({ step: 4 })}>종료 확인 →</button>
      </div>
    </div>
  );
}

export default function Workbench({ s, update, act }: ViewProps) {
  const [intentOpen, setIntentOpen] = useState(false);
  const phase = workPhase(s);
  const summary = counts(s.criteria);
  return (
    <div className="workbench">
      <WorkbenchBar s={s} phase={phase} update={update} onIntent={() => setIntentOpen(true)} />
      <div className="wb-grid">
        <CriteriaPanel s={s} summary={summary} phase={phase} act={act} onFix={() => setIntentOpen(true)} />
        <PreviewPane s={s} phase={phase} update={update} act={act} />
      </div>
      <ChatPane s={s} phase={phase} act={act} />
      <IntentDrawer s={s} act={act} open={intentOpen} onClose={() => setIntentOpen(false)} />
    </div>
  );
}
