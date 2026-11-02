import { useState } from 'react';
import { counts, workPhase } from '@intent-loop/features/intent-loop/model';
import ChatPane from './ChatPane';
import CriteriaPanel from './CriteriaPanel';
import IntentPane from './IntentPane';
import PreviewPane from './PreviewPane';

const phaseLabels = { building: '개발 중', preparing: '앱 준비 중', review: '검토 대기', 'run-error': '작업 중단', 'preview-error': '앱 실행 실패' };

function WorkbenchBar({ s, phase, summary, update }) {
  return (
    <div className="wb-bar">
      <div className="wb-title">
        <span className="badge">Round {s.round + 1}</span>
        <strong>{phaseLabels[phase]}</strong>
        <span className="wb-counts">통과 {summary.pass} · 수정 {summary.fix} · 불가 {summary.unverifiable} · 미확인 {summary.unchecked}</span>
      </div>
      <button className="button primary" onClick={() => update({ step: 4 })}>종료 확인 →</button>
    </div>
  );
}

export default function Workbench({ s, update, act }) {
  const [focusSignal, setFocusSignal] = useState(0);
  const phase = workPhase(s);
  const summary = counts(s.criteria);
  const focusChat = () => setFocusSignal(n => n + 1);
  return (
    <div className="workbench">
      <WorkbenchBar s={s} phase={phase} summary={summary} update={update} />
      <div className="wb-grid">
        <CriteriaPanel s={s} summary={summary} phase={phase} act={act} onFix={focusChat} />
        <PreviewPane s={s} phase={phase} update={update} act={act} />
        <aside className="wb-side wb-right">
          <div className="card-title">가상 intent.md <span className="badge">개발 기준</span></div>
          <IntentPane s={s} act={act} />
        </aside>
      </div>
      <ChatPane s={s} phase={phase} act={act} focusSignal={focusSignal} />
    </div>
  );
}
