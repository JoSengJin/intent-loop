import { statusNames } from '@intent-loop/features/intent-loop/model';

const marks = { pass: '✓', fix: '✗', unverifiable: '?', unchecked: '○' };

function Block({ title, children }) {
  return <div className="sum-block"><h4>{title}</h4>{children}</div>;
}

function Text({ value }) {
  return value?.trim() ? <p className="sum-text">{value}</p> : <p className="sum-empty">아직 비어 있어요</p>;
}

function Scope({ s }) {
  const rows = [['포함', s.include], ['제외', s.exclude], ['지켜야 할 것', s.protect]];
  return rows.map(([label, value]) => (
    <div className="sum-scope" key={label}>
      <span className="badge">{label}</span>
      {value.trim() ? <p className="sum-text">{value}</p> : <p className="sum-empty">—</p>}
    </div>
  ));
}

export default function IntentSummary({ s }) {
  const request = s.requests.at(-1);
  return (
    <div className="intent-summary">
      <Block title="해결할 문제"><Text value={s.problem} /></Block>
      <Block title="기대하는 결과"><Text value={s.outcome} /></Block>
      <Block title="범위"><Scope s={s} /></Block>
      <Block title="완료 기준">
        {s.criteria.map(c => (
          <div className={`sum-criterion ${c.status}`} key={c.id} title={statusNames[c.status]}>
            <span className="sum-mark">{marks[c.status]}</span>
            <span><b>C{c.id}</b> {c.text || '(비어 있음)'}</span>
          </div>
        ))}
      </Block>
      <Block title="아직 정하지 못한 사항"><Text value={s.unknown} /></Block>
      {request && <Block title={`이번 수정 요청 · Round ${request.round}`}><Text value={request.message} /></Block>}
    </div>
  );
}
