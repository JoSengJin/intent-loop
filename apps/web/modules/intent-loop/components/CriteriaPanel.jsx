import { patchCriterion, selectCriterion, setCriterionStatus } from '@intent-loop/features/intent-loop/criteria';
import { statusNames } from '@intent-loop/features/intent-loop/model';

const badgeClass = { pass: 'green', fix: 'red', unverifiable: 'yellow', unchecked: '' };

function Choices({ c, disabled, onChoose }) {
  return (
    <div className="review-options">
      {['pass', 'fix', 'unverifiable'].map(status => (
        <button
          key={status}
          className={`choice ${c.status === status ? `active ${status}` : ''}`}
          disabled={disabled || (!c.visible && status !== 'unverifiable')}
          onClick={e => { e.stopPropagation(); onChoose(status); }}
        >
          {statusNames[status]}
        </button>
      ))}
    </div>
  );
}

function CriterionCard({ c, selected, disabled, act, onFix }) {
  const choose = status => {
    act(setCriterionStatus, c.id, status);
    if (status === 'fix') onFix();
  };
  return (
    <div className={`review-card ${selected ? 'selected' : ''}`} onClick={() => act(selectCriterion, c.id)}>
      <div className="review-card-head">
        <span className="badge">C{c.id}</span>
        <span className={`badge ${badgeClass[c.status]}`}>{statusNames[c.status]}</span>
      </div>
      <h3>{c.text}</h3>
      <p>확인 위치·상태: {c.location || '—'}</p>
      {c.revisit && <div className="assumption">{c.status === 'pass' ? '수정 이후 재확인 권장' : '다시 확인'}</div>}
      <Choices c={c} disabled={disabled} onChoose={choose} />
      {c.status === 'unverifiable' && (
        <input
          className="text-input reason-input"
          aria-label={`C${c.id} 확인 불가 사유`}
          value={c.reason}
          onClick={e => e.stopPropagation()}
          onChange={e => act(patchCriterion, c.id, { reason: e.target.value })}
          placeholder="확인 불가 사유를 적어주세요"
        />
      )}
    </div>
  );
}

export default function CriteriaPanel({ s, summary, phase, act, onFix }) {
  const disabled = phase !== 'review';
  return (
    <aside className="wb-side wb-criteria">
      <div className="card-title">완료 기준 <span className="badge">{summary.pass}/{s.criteria.length} 통과</span></div>
      {disabled && <p className="hint">앱 미리보기가 준비되면 기준을 확인할 수 있어요.</p>}
      <div className="review-list">
        {s.criteria.map(c => <CriterionCard key={c.id} c={c} selected={s.selected === c.id} disabled={disabled} act={act} onFix={onFix} />)}
      </div>
      {s.unknown.trim() && <div className="assumption"><b>미정 사항 (임시 가정)</b><br />{s.unknown}</div>}
    </aside>
  );
}
