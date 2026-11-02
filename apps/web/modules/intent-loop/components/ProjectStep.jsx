import Field from './Field';
import PageHead from './PageHead';
import { useFolderPicker } from '../hooks/use-folder-picker';

function blockReason(s) {
  if (!s.project) return '프로젝트 폴더를 선택해 주세요.';
  if (!s.command.trim()) return '실행 명령을 입력해 주세요.';
  return /^\d+$/.test(s.port) ? '' : '포트는 숫자로 입력해 주세요.';
}

function folderHint(s) {
  if (!s.project) return 'Claude Code에서 프로젝트 폴더를 여는 것과 같은 단계입니다.';
  return s.detected ? '선택된 폴더의 package.json을 확인했습니다.' : '폴더를 선택했습니다. 실행 정보를 확인해 주세요.';
}

export default function ProjectStep({ s, update, act }) {
  const { folderRef, folderError, selectFolder, chooseFolder } = useFolderPicker({ update, act });
  const reason = blockReason(s);
  const useSample = () => update({ project: 'sample-project', command: 'npm run dev', port: '3000', detected: true });
  return (
    <>
      <PageHead step={1} title="작업할 프로젝트를 선택하세요" text="에이전트가 참고할 코드베이스와 미리보기 실행 방법을 확인합니다." />
      <div className="notice gray">ℹ️　프로토타입에서는 폴더 이름과 실행 설정만 읽습니다. 실제 파일 수정이나 앱 실행은 하지 않습니다.</div>
      <div className="card card-pad">
        <div className="card-title">코드베이스 폴더</div>
        <div className="folder-drop">
          <div>
            <strong>{s.project || '프로젝트 폴더를 선택해 주세요'}</strong>
            <small>{folderHint(s)}</small>
          </div>
          <div className="folder-actions">
            <input ref={folderRef} type="file" webkitdirectory="" directory="" multiple className="hidden" onClick={e => { e.currentTarget.value = ''; }} onChange={chooseFolder} />
            <button className="button" onClick={selectFolder}>폴더 선택</button>
            <button className="button ghost" onClick={useSample}>샘플 프로젝트 사용</button>
          </div>
        </div>
      </div>
      {folderError && <div className="notice warning">{folderError}</div>}
      <div className="card card-pad" style={{ marginTop: 18 }}>
        <div className="card-title">미리보기 실행 정보 <span className="badge">확인만 해주세요</span></div>
        {s.detected && <div className="detect-row"><span className="badge">자동 감지</span> package.json에서 실행 정보를 찾았어요.</div>}
        {s.project && !s.detected && <div className="notice warning">실행 정보를 감지하지 못했어요. 명령과 포트를 직접 입력해 주세요.</div>}
        <div className="grid-2">
          <Field label="실행 명령" hint="앱을 실행할 때 사용할 명령" value={s.command} onChange={v => update({ command: v })} placeholder="예: npm run dev" />
          <Field label="포트" hint="미리보기 주소에 사용할 포트" value={s.port} onChange={v => update({ port: v })} placeholder="예: 3000" />
        </div>
      </div>
      <div className="footer-actions">
        <div />
        <div className="action-right">
          <button className="button primary" disabled={Boolean(reason)} onClick={() => update({ step: 2 })}>이 프로젝트로 시작 →</button>
          {reason && <p className="validation">{reason}</p>}
        </div>
      </div>
    </>
  );
}
