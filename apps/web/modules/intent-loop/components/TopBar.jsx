import { steps } from '@intent-loop/features/intent-loop/model';

export default function TopBar({ s, saveError }) {
  return (
    <header className="topbar">
      <div className="breadcrumb">작업 흐름 <span>/</span> <strong>{steps[s.step - 1]}</strong></div>
      <div className="top-meta">
        <span className="demo-pill">DEMO</span>
        <span>{saveError ? '저장 실패 · 브라우저 저장 공간을 확인하세요' : '로컬에 자동 저장'}</span>
      </div>
    </header>
  );
}
