import SampleApp from './SampleApp';

const titles = { signup: '새 계정 만들기', dashboard: '내 작업 목록', home: '해야 할 일을, 한곳에서.' };

function openWindow(screen) {
  const windowRef = window.open('', '_blank');
  if (!windowRef) return;
  const style = 'body{font-family:Arial,sans-serif;margin:0;color:#234049;background:#f7fbfb}header{padding:22px 7%;background:#fff;border-bottom:1px solid #e2e8e8;font-weight:bold}main{max-width:600px;margin:90px auto;text-align:center;padding:20px}h1{font-size:32px}p{color:#728b90}';
  windowRef.document.write(`<!doctype html><html lang="ko"><meta charset="utf-8"><title>샘플 앱</title><style>${style}</style><header>모아 · 샘플 앱</header><main><h1>${titles[screen] || titles.home}</h1><p>프로토타입 미리보기입니다. 실제 앱 실행 화면은 추후 연결합니다.</p></main></html>`);
  windowRef.document.close();
}

export default function PreviewFrame({ s, onScreen }) {
  return (
    <div className="preview-frame">
      <div className="preview-bar">
        <span className="dots">•••</span>
        <span className="url">http://localhost:{s.port}{s.previewPath}</span>
        <button className="button ghost small" onClick={() => openWindow(s.previewScreen)}>새 창에서 열기 ↗</button>
      </div>
      <SampleApp screen={s.previewScreen} onScreen={onScreen} />
    </div>
  );
}
