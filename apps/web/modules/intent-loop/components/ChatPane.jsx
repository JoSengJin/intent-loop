import { useEffect, useRef, useState } from 'react';
import { submitRevision } from '@intent-loop/features/intent-loop/revision';

function History({ s, targets }) {
  if (!s.requests.length) {
    const text = targets.length
      ? '수정이 필요한 기준을 확인했습니다. 기대한 동작과 실제 화면, 원하는 변경을 편하게 적어주세요.'
      : '화면이나 동작을 자연어로 요청하면 개발 문서에 반영해 다음 작업에 전달합니다.';
    return <div className="chat-history"><div className="chat-message agent-message"><small>에이전트</small><p>{text}</p></div></div>;
  }
  return (
    <div className="chat-history">
      {s.requests.map(request => (
        <div key={request.round}>
          <div className="chat-message user-message">
            <small>나 · {request.sentAt}</small>
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

function Attachments({ s, targets }) {
  return (
    <div className="chat-attachments attach-preview">
      <span className="hint">함께 전달돼요</span>
      {targets.map(c => <span className="badge red" key={c.id}>C{c.id} · {c.text.slice(0, 18)}</span>)}
      <span className="badge">{`http://localhost:${s.port}${s.previewPath}`}</span>
    </div>
  );
}

export default function ChatPane({ s, phase, act, focusSignal }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);
  const targets = s.criteria.filter(c => c.status === 'fix');
  const canSend = Boolean(draft.trim()) && phase === 'review';
  useEffect(() => { if (focusSignal) inputRef.current?.focus(); }, [focusSignal]);

  const send = () => {
    if (!canSend) return;
    act(submitRevision, draft);
    setDraft('');
  };
  const onKeyDown = e => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    send();
  };

  return (
    <section className="chat-pane">
      <History s={s} targets={targets} />
      <Attachments s={s} targets={targets} />
      <textarea
        ref={inputRef}
        className="textarea"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="예: 이 화면의 여백을 줄이고, 가입 버튼을 누르면 이메일 입력 폼이 열리도록 수정해줘."
      />
      <span className="hint">Enter 전송 · Shift+Enter 줄바꿈{phase !== 'review' ? ' · 개발이 끝나면 보낼 수 있어요' : ''}</span>
      <div className="action-right"><button className="button primary" disabled={!canSend} onClick={send}>개발 지시 보내기 →</button></div>
    </section>
  );
}
