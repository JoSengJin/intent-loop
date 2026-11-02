import { addCriterion, patchCriterion, removeCriterion } from '@intent-loop/features/intent-loop/criteria';

const vagueWords = /깔끔하게|빠르게|좋게|예쁘게|사용하기 쉽게|직관적으로/;

function visibilityPatch(visible) {
  return { visible, status: 'unchecked', reason: visible ? '' : '화면만으로 확인할 수 없음' };
}

function CriterionRow({ c, canRemove, act }) {
  const patch = values => act(patchCriterion, c.id, values);
  return (
    <div className="criteria-edit">
      <div className="criteria-edit-head">
        <strong>C{c.id}</strong>
        {canRemove && <button className="button ghost small" onClick={() => act(removeCriterion, c.id)}>삭제</button>}
      </div>
      <div className="criteria-edit-grid">
        <input className="text-input" aria-label={`C${c.id} 확인할 내용`} value={c.text} onChange={e => patch({ text: e.target.value })} placeholder="확인할 내용" />
        <input className="text-input" aria-label={`C${c.id} 확인 위치와 상태`} value={c.location} onChange={e => patch({ location: e.target.value })} placeholder="확인 위치·상태" />
        <select className="select" aria-label={`C${c.id} 화면 확인 여부`} value={c.visible ? 'yes' : 'no'} onChange={e => patch(visibilityPatch(e.target.value === 'yes'))}>
          <option value="yes">화면 확인 가능</option>
          <option value="no">화면 확인 불가</option>
        </select>
      </div>
      {vagueWords.test(c.text) && (
        <div className="vague">
          화면에서 확인하기 어려워요. 이렇게 바꿔볼까요?<br />
          <strong>예: 지정한 화면에 결과가 표시되고 버튼을 누르면 다음 상태로 바뀐다.</strong>
        </div>
      )}
    </div>
  );
}

export default function CriteriaEditor({ criteria, act }) {
  return (
    <div className="field">
      <div className="field-label">완료 기준 *</div>
      <p className="hint">화면에서 직접 보고 확인할 수 있는 문장으로 적어주세요.</p>
      {criteria.map(c => <CriterionRow key={c.id} c={c} canRemove={criteria.length > 1} act={act} />)}
      <button className="button small" onClick={() => act(addCriterion)}>+ 기준 추가</button>
    </div>
  );
}
