import { intentMarkdown } from '@intent-loop/features/intent-loop/intent-markdown';
import { startBuild } from '@intent-loop/features/intent-loop/revision';
import { downloadIntent } from '../lib/download-intent';
import CriteriaEditor from './CriteriaEditor';
import Field from './Field';
import PageHead from './PageHead';

export default function IntentStep({ s, update, act }) {
  const valid = s.problem.trim() && s.criteria.length > 0 && s.criteria.every(c => c.text.trim());
  return (
    <>
      <PageHead step={2} title="원하는 결과를 적어주세요" text="에이전트가 개발할 방향과 직접 확인할 완료 기준을 정합니다." />
      <div className="intent-layout">
        <div className="card card-pad">
          <Field label="해결할 문제 *" hint="지금 무엇이 불편하거나 없나요?" value={s.problem} onChange={v => update({ problem: v })} placeholder="예: 사용자가 할 일을 여러 곳에 적어 놓아 우선순위를 놓칩니다." multiline />
          <Field label="기대하는 결과" hint="끝나면 사용자가 무엇을 할 수 있게 되나요?" value={s.outcome} onChange={v => update({ outcome: v })} placeholder="예: 한 화면에서 오늘 할 일을 보고 완료할 수 있습니다." multiline />
          <div className="field">
            <div className="field-label">범위</div>
            <p className="hint">이번에 할 것과 하지 않을 것을 적어주세요.</p>
            <div className="scope-grid">
              <input className="text-input" value={s.include} onChange={e => update({ include: e.target.value })} placeholder="포함: 이번에 할 것" />
              <input className="text-input" value={s.exclude} onChange={e => update({ exclude: e.target.value })} placeholder="제외: 이번에 하지 않을 것" />
              <textarea className="textarea full" value={s.protect} onChange={e => update({ protect: e.target.value })} placeholder={'지켜야 할 것: 코딩 규칙, 디자인 시스템, 수정 금지 파일 등\n여러 줄로 적을 수 있어요.'} />
            </div>
          </div>
          <CriteriaEditor criteria={s.criteria} act={act} />
          <Field label="아직 정하지 못한 사항" hint="정해지지 않은 것은 임시 가정과 함께 적어주세요." value={s.unknown} onChange={v => update({ unknown: v })} placeholder="예: 로그인 방식 — 임시 가정: 이메일 로그인" multiline />
        </div>
        <div className="card card-pad raw-card">
          <div className="card-title">intent.md 원문 보기 <span className="badge">실시간 반영</span></div>
          <pre>{intentMarkdown(s)}</pre>
          <button className="button small" style={{ marginTop: 12 }} onClick={() => downloadIntent(intentMarkdown(s))}>intent.md 내려받기</button>
        </div>
      </div>
      <div className="footer-actions">
        <button className="button ghost" onClick={() => update({ step: 1 })}>← 프로젝트 설정</button>
        <div className="action-right">
          <button className="button primary" disabled={!valid} onClick={() => act(startBuild)}>에이전트에게 개발 맡기기 →</button>
          {!valid && <p className="validation">해결할 문제와 완료 기준 1개 이상의 내용을 입력해 주세요.</p>}
        </div>
      </div>
    </>
  );
}
