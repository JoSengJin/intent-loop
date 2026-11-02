function Home({ onScreen }) {
  return (
    <div className="sample-hero">
      <div className="eyebrow">SAMPLE APPLICATION</div>
      <h2>해야 할 일을, 한곳에서.</h2>
      <p>흩어진 할 일을 모아 오늘 중요한 일에 집중하세요.<br />간단한 흐름으로 매일의 진전을 확인할 수 있어요.</p>
      <button className="button primary" onClick={() => onScreen('signup')}>무료로 시작하기 →</button>
    </div>
  );
}

function Signup({ onScreen }) {
  return (
    <div className="sample-card">
      <span className="badge green">샘플 앱 화면</span>
      <h2>새 계정 만들기</h2>
      <p>이메일로 바로 시작해 보세요.</p>
      <input className="text-input" placeholder="이메일 주소" />
      <input className="text-input" placeholder="비밀번호" type="password" />
      <button className="button primary" onClick={() => onScreen('dashboard')}>계정 만들기</button>
    </div>
  );
}

function Dashboard({ onScreen }) {
  return (
    <div className="sample-card">
      <span className="badge green">샘플 앱 화면</span>
      <h2>내 작업 목록</h2>
      <p>오늘 할 일을 확인하고 완료해 보세요.</p>
      <div className="summary-item"><input type="checkbox" />　첫 작업 추가하기</div>
      <button className="button primary" onClick={() => onScreen('home')}>홈으로 돌아가기</button>
    </div>
  );
}

const screens = { home: Home, signup: Signup, dashboard: Dashboard };

export default function SampleApp({ screen, onScreen }) {
  const Screen = screens[screen] || Home;
  return (
    <div className="preview-body">
      <div className="sample-top">
        <span className="sample-logo">모아</span>
        <span>서비스 소개　　시작하기　　마이페이지</span>
      </div>
      <Screen onScreen={onScreen} />
    </div>
  );
}
