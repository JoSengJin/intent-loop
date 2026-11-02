const copy = {
  building: ['에이전트가 개발하고 있어요', '진행 상태를 확인할 수 있어요. 끝나면 앱 미리보기가 자동으로 열립니다.'],
  preparing: ['앱을 실행하고 있어요', '개발이 끝났어요. 미리보기 준비가 끝나면 바로 확인할 수 있어요.'],
  'run-error': ['작업이 멈췄어요', '다시 시도하거나 Intent를 고쳐 보세요.'],
  'preview-error': ['앱 실행에 실패했어요', '샘플 오류: 지정한 포트에서 앱을 열 수 없습니다.'],
};

function Progress({ phase }) {
  const rows = ['Intent와 프로젝트 분석', '화면과 동작 구현', '결과 정리'];
  return (
    <div className="progress-list">
      {rows.map((name, i) => {
        const done = phase !== 'building' || i === 0;
        return (
          <div className={`progress-row ${phase === 'building' && i === 1 ? 'current' : ''}`} key={name}>
            <span className="progress-icon">{done ? '✓' : i + 1}</span>
            <strong>{name}</strong>
          </div>
        );
      })}
    </div>
  );
}

function Controls({ phase, update }) {
  if (phase === 'building') {
    return (
      <div className="footer-actions run-controls">
        <button className="button danger" onClick={() => update({ run: 'stopped' })}>중단</button>
        <button className="button ghost small" onClick={() => update({ run: 'failed' })}>실패 상황 보기</button>
      </div>
    );
  }
  if (phase === 'run-error') return <div className="footer-actions run-controls"><button className="button" onClick={() => update({ run: 'running' })}>다시 시도</button></div>;
  if (phase === 'preview-error') return <div className="footer-actions run-controls"><button className="button" onClick={() => update({ preview: 'running' })}>다시 실행</button></div>;
  return <div className="footer-actions run-controls"><button className="button ghost small" onClick={() => update({ preview: 'failed' })}>실패 상황 보기</button></div>;
}

export function RunLog({ s, phase }) {
  const failed = phase === 'run-error' || phase === 'preview-error';
  return (
    <details className="run-log" open={failed}>
      <summary>실행 로그</summary>
      <div className="log">
        <span>$</span> intent.md 읽기 완료<br />
        <span>$</span> {s.round ? '수정 요청 분석' : '프로젝트 구조 분석'} {phase === 'building' ? '중...' : '완료'}<br />
        <span>$</span> {s.command}<br />
        <span>$</span> http://localhost:{s.port} {phase === 'review' ? '준비 완료' : failed ? '연결 실패' : '준비 중...'}
      </div>
    </details>
  );
}

export default function RunStatus({ s, phase, update }) {
  const [title, text] = copy[phase];
  return (
    <div className="card card-pad run-status">
      <div className="status-hero">
        {(phase === 'building' || phase === 'preparing') && <span className="spinner" />}
        <div><b>{title}</b><p>{text}</p></div>
      </div>
      <Progress phase={phase} />
      <RunLog s={s} phase={phase} />
      <Controls phase={phase} update={update} />
    </div>
  );
}
