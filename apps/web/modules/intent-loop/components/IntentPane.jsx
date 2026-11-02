import { useState } from 'react';
import { intentMarkdown } from '@intent-loop/features/intent-loop/intent-markdown';
import { applyIntentDocument } from '@intent-loop/features/intent-loop/revision';
import { downloadIntent } from '../lib/download-intent';
import IntentSummary from './IntentSummary';

function RawEditor({ s, act }) {
  const [draft, setDraft] = useState(null);
  const markdown = intentMarkdown(s);
  const apply = () => { act(applyIntentDocument, draft); setDraft(null); };
  return (
    <div>
      <textarea className="textarea intent-editor" aria-label="가상 intent.md 편집" value={draft ?? markdown} onChange={e => setDraft(e.target.value)} />
      {!s.intentSynced && draft === null && <p className="hint">문서는 저장했지만 완료 기준 형식을 읽지 못해 기준 목록은 그대로예요.</p>}
      <div className="intent-actions">
        <button className="button small primary" disabled={draft === null} onClick={apply}>문서 변경 반영</button>
        <button className="button small ghost" disabled={draft === null} onClick={() => setDraft(null)}>되돌리기</button>
        <button className="button small ghost" onClick={() => downloadIntent(markdown)}>내려받기</button>
        {draft !== null && <span className="badge yellow">반영 전</span>}
      </div>
    </div>
  );
}

export default function IntentPane({ s, act }) {
  const [view, setView] = useState('summary');
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
