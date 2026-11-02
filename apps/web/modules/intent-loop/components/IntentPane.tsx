import { useState } from 'react';
import { intentMarkdown } from '@intent-loop/features/intent-loop/intent-markdown';
import { applyIntentDocument } from '@intent-loop/features/intent-loop/revision';
import type { Act, IntentState } from '@intent-loop/features/intent-loop/types';
import { downloadIntent } from '../lib/download-intent';
import IntentSummary from './IntentSummary';

function RawEditor({ s, act }: { s: IntentState; act: Act }) {
  const [draft, setDraft] = useState<string | null>(null);
  const markdown = intentMarkdown(s);
  const apply = () => {
    if (draft === null) return;
    act(applyIntentDocument, draft);
    setDraft(null);
  };
  return (
    <div>
      {!s.intentSynced && draft === null && <div className="notice warning">문서는 저장했지만 `# 해결할 문제`·`# 범위`·`# 완료 기준` 등 섹션을 읽지 못해 왼쪽 기준 목록은 그대로예요.</div>}
      <textarea className="textarea intent-editor" aria-label="가상 intent.md 편집" value={draft ?? markdown} onChange={e => setDraft(e.target.value)} />
      <p className="hint" style={{ marginTop: 8 }}>완료 기준은 `- 내용` 한 줄로 추가할 수 있어요. 반영하면 왼쪽 목록에 동기화됩니다.</p>
      <div className="intent-actions">
        <button className="button small primary" disabled={draft === null} onClick={apply}>문서 변경 반영</button>
        <button className="button small ghost" disabled={draft === null} onClick={() => setDraft(null)}>되돌리기</button>
        <button className="button small ghost" onClick={() => downloadIntent(markdown)}>내려받기</button>
        {draft !== null && <span className="badge yellow">반영 전</span>}
      </div>
    </div>
  );
}

export default function IntentPane({ s, act }: { s: IntentState; act: Act }) {
  const [view, setView] = useState<'summary' | 'raw'>('summary');
  return (
    <section className="intent-pane">
      <div className="sub-tabs">
        <button className={view === 'summary' ? 'active' : ''} onClick={() => setView('summary')}>요약</button>
        <button className={view === 'raw' ? 'active' : ''} onClick={() => setView('raw')}>원문 편집</button>
      </div>
      <div className={view === 'summary' ? '' : 'hidden'}><IntentSummary s={s} /></div>
      <div className={view === 'raw' ? '' : 'hidden'}><RawEditor s={s} act={act} /></div>
    </section>
  );
}
