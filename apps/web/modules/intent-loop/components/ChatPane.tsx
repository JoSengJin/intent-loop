import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { submitRevision } from '@intent-loop/features/intent-loop/revision';
import type { Act, Criterion, IntentState, RevisionRequest, WorkPhase } from '@intent-loop/features/intent-loop/types';

function History({ requests }: { requests: RevisionRequest[] }) {
  return (
    <div className="chat-history dock-history">
      {requests.map(request => (
        <div key={request.round}>
          <div className="chat-message user-message">
            <small>나 · Round {request.round} · {request.sentAt}</small>
            <p>{request.message}</p>
            <div className="chat-attachments">
              {request.items.map(item => <span className="badge" key={item.id}>C{item.id} · 수정 대상</span>)}
              <span className="badge">{request.url}</span>
            </div>
          </div>
          <div className="chat-message agent-message">
            <small>에이전트</small>
            <p>요청과 완료 기준을 반영해 수정 작업을 시작합니다. 완료되면 다시 확인할 수 있도록 기준을 미확인으로 돌렸습니다.</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Prompt({ targets }: { targets: Criterion[] }) {
  if (!targets.length) return null;
  const names = targets.map(c => `C${c.id} "${c.text}"`).join(', ');
  return <div className="dock-prompt"><b>에이전트</b> {names}에서 무엇이 기대와 달랐나요? 기대한 동작 · 실제 화면 · 원하는 변경을 적어주세요.</div>;
}

function Attachments({ s, targets }: { s: IntentState; targets: Criterion[] }) {
  return (
    <div className="chat-attachments attach-preview">
      <span className="hint">지시와 함께 에이전트에게 전달</span>
      {targets.map(c => <span className="badge red" key={c.id}>수정 대상 · C{c.id} {c.text.slice(0, 14)}</span>)}
      <span className="badge">보고 있던 화면 · {`localhost:${s.port}${s.previewPath}`}</span>
    </div>
  );
}

interface ChatPaneProps {
  s: IntentState;
  phase: WorkPhase;
  act: Act;
  focusSignal: number;
}

export default function ChatPane({ s, phase, act, focusSignal }: ChatPaneProps) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const targets = s.criteria.filter(c => c.status === 'fix');
  const canSend = Boolean(draft.trim()) && phase === 'review';
  useEffect(() => { if (focusSignal) inputRef.current?.focus(); }, [focusSignal]);

  const send = () => {
    if (!canSend) return;
    act(submitRevision, draft);
    setDraft('');
    setOpen(true);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    send();
  };

  return (
    <section className="chat-dock">
      {open && s.requests.length > 0 && <History requests={s.requests} />}
      <div className="dock-top">
        <span className="loop-guide">확인 → <b>수정 필요</b> → 지시 → 재개발 → 재확인</span>
        {s.requests.length > 0 && <button className="button ghost small" onClick={() => setOpen(v => !v)}>{open ? '대화 기록 접기' : `대화 기록 ${s.requests.length}`}</button>}
      </div>
      <Prompt targets={targets} />
      <Attachments s={s} targets={targets} />
      <div className="dock-row">
        <textarea
          ref={inputRef}
          className="textarea"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="예: 이 화면의 여백을 줄이고, 가입 버튼을 누르면 이메일 입력 폼이 열리도록 수정해줘."
        />
        <button className="button primary" disabled={!canSend} onClick={send}>개발 지시 보내기 →</button>
      </div>
      <span className="hint">Enter 전송 · Shift+Enter 줄바꿈{phase !== 'review' ? ' · 개발이 끝나면 보낼 수 있어요' : ''}</span>
    </section>
  );
}
