import { counts, initialState, statusNames } from '@intent-loop/features/intent-loop/model';
import { finishWork } from '@intent-loop/features/intent-loop/revision';
import type { Criterion, CriterionStatus, IntentState } from '@intent-loop/features/intent-loop/types';
import PageHead from './PageHead';
import type { ViewProps } from './types';

function Group({ status, criteria }: { status: CriterionStatus; criteria: Criterion[] }) {
  const items = criteria.filter(c => c.status === status);
  return (
    <div className="summary-group">
      <h3>{statusNames[status]} · {items.length}</h3>
      {items.length ? items.map(c => (
        <div className="summary-item" key={c.id}>
          <b>C{c.id}</b>
          <div>{c.text}{status === 'unverifiable' && <small>사유: {c.reason || '사유 미입력'}</small>}</div>
        </div>
      )) : <div className="empty">해당 기준이 없습니다.</div>}
    </div>
  );
}

function blockReason(s: IntentState, summary: Record<CriterionStatus, number>): string {
  if (summary.unchecked) return `미확인 기준 ${summary.unchecked}개를 먼저 확인해 주세요.`;
  if (s.criteria.some(c => c.status === 'unverifiable' && !c.reason.trim())) return '확인 불가 사유를 입력해 주세요.';
  return (summary.fix || summary.unverifiable) && !s.finishConfirmed ? '남은 기준을 확인하고 종료 동의에 체크해 주세요.' : '';
}

const statusOrder: CriterionStatus[] = ['pass', 'fix', 'unverifiable', 'unchecked'];

export default function FinishStep({ s, update, act, setS }: ViewProps) {
  const summary = counts(s.criteria);
  const reason = blockReason(s, summary);
  const hasOpen = summary.fix + summary.unverifiable > 0;
  return (
    <>
      <PageHead step={4} title={s.finished ? '작업을 종료했어요' : '작업을 종료하기 전에 확인하세요'} text="기준별 결과를 확인하고 직접 작업을 종료합니다." />
      <div className="card card-pad">
        {s.finished && (
          <div className="finished">
            <span className="check">✓</span>
            <h2>작업이 종료됐어요</h2>
            <p>사용자가 {s.finishedAt}에 직접 종료했습니다.</p>
            <button className="button primary" onClick={() => setS({ ...initialState })}>새 작업 시작</button>
          </div>
        )}
        {statusOrder.map(status => <Group key={status} status={status} criteria={s.criteria} />)}
        {!s.finished && hasOpen && (
          <div className="confirm-box">
            <label>
              <input type="checkbox" checked={s.finishConfirmed} onChange={e => update({ finishConfirmed: e.target.checked })} />
              수정 필요 또는 확인 불가 기준이 남아 있습니다. 이 상태로 종료할게요. 이 선택을 종료 기록에 남깁니다.
            </label>
          </div>
        )}
      </div>
      {!s.finished && (
        <div className="footer-actions">
          <button className="button ghost" onClick={() => update({ step: 3 })}>← 검토로 돌아가기</button>
          <div className="action-right">
            <button className="button primary" disabled={Boolean(reason)} onClick={() => act(finishWork)}>작업 종료</button>
            {reason && <p className="validation">{reason}</p>}
          </div>
        </div>
      )}
    </>
  );
}
