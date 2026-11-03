import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { submitRevision } from '@intent-loop/features/intent-loop/revision';
import type { Act, Criterion, IntentState, RevisionRequest, WorkPhase } from '@intent-loop/features/intent-loop/types';

function History({ requests }: { requests: RevisionRequest[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [requests.length]);
  return (
    <div className="chat-history dock-history" ref={listRef}>
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

function placeholderFor(targets: Criterion[], phase: WorkPhase) {
  if (phase !== 'review') return '개발이 끝나면 수정 지시를 보낼 수 있어요';
  if (!targets.length) return '예: 이 화면의 여백을 줄이고, 가입 버튼을 누르면 이메일 입력 폼이 열리도록 수정해줘.';
  const names = targets.map(c => `C${c.id}`).join(', ');
  return `${names}에서 무엇이 기대와 달랐나요? 기대한 동작 · 실제 화면 · 원하는 변경을 적어주세요.`;
}

function Chips({ s, targets }: { s: IntentState; targets: Criterion[] }) {
  return (
    <>
      {targets.map(c => <span className="badge red" key={c.id}>수정 대상 · C{c.id} {c.text.slice(0, 14)}</span>)}
      <span className="badge" title="지시와 함께 에이전트에게 전달됩니다">{`localhost:${s.port}${s.previewPath}`}</span>
    </>
  );
}

interface ChatPaneProps {
  s: IntentState;
  phase: WorkPhase;
  act: Act;
}

export default function ChatPane({ s, phase, act }: ChatPaneProps) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const targets = s.criteria.filter(c => c.status === 'fix');
  const canSend = Boolean(draft.trim()) && phase === 'review';
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    if (draft) input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }, [draft]);

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
      <div className="dock-chips">
        <Chips s={s} targets={targets} />
        <span className="dock-keys">Enter 전송 · Shift+Enter 줄바꿈</span>
        {s.requests.length > 0 && <button className="button ghost small" onClick={() => setOpen(v => !v)}>{open ? '기록 접기' : `기록 ${s.requests.length}`}</button>}
      </div>
      <div className="dock-row">
        <textarea
          ref={inputRef}
          className="textarea"
          rows={1}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholderFor(targets, phase)}
        />
        <button className="button primary" disabled={!canSend} onClick={send}>보내기 →</button>
      </div>
    </section>
  );
}
