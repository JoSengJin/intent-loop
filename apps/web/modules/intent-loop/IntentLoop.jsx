'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { counts, detectPackage, initialState, intentMarkdown, steps } from '@intent-loop/features/intent-loop/model';

const key = 'intent-loop-prototype-v1';
const vagueWords = /깔끔하게|빠르게|좋게|예쁘게|사용하기 쉽게|직관적으로/;
const names = { unchecked: '미확인', pass: '통과', fix: '수정 필요', unverifiable: '확인 불가' };

function readSaved() { try { return JSON.parse(localStorage.getItem(key)) || initialState; } catch { return initialState; } }
function head(step, title, text) { return <div className="page-head"><div><div className="eyebrow">STEP {String(step).padStart(2, '0')} / 07</div><h1>{title}</h1><p>{text}</p></div><div className="step-count"><b>{step}</b> / 7</div></div>; }
function Field({ label, hint, value, onChange, placeholder, multiline = false }) { return <div className="field"><label>{label}</label><p className="hint">{hint}</p>{multiline ? <textarea className="textarea" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /> : <input className="text-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}</div>; }

function SampleApp({ screen, onScreen }) {
  return <div className="preview-body"><div className="sample-top"><span className="sample-logo">모아</span><span>서비스 소개　　시작하기　　마이페이지</span></div>{screen === 'home' ? <div className="sample-hero"><div className="eyebrow">SAMPLE APPLICATION</div><h2>해야 할 일을, 한곳에서.</h2><p>흩어진 할 일을 모아 오늘 중요한 일에 집중하세요.<br />간단한 흐름으로 매일의 진전을 확인할 수 있어요.</p><button className="button primary" onClick={() => onScreen('signup')}>무료로 시작하기 →</button></div> : <div className="sample-card"><span className="badge green">샘플 앱 화면</span><h2>{screen === 'signup' ? '새 계정 만들기' : '내 작업 목록'}</h2><p>{screen === 'signup' ? '이메일로 바로 시작해 보세요.' : '오늘 할 일을 확인하고 완료해 보세요.'}</p>{screen === 'signup' ? <><input className="text-input" placeholder="이메일 주소" /><input className="text-input" placeholder="비밀번호" type="password" /><button className="button primary" onClick={() => onScreen('dashboard')}>계정 만들기</button></> : <><div className="summary-item"><input type="checkbox" />　첫 작업 추가하기</div><button className="button primary" onClick={() => onScreen('home')}>홈으로 돌아가기</button></>}</div>}</div>;
}

export default function IntentLoop() {
  const [s, setS] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [folderError, setFolderError] = useState('');
  const [chatDraft, setChatDraft] = useState('');
  const [intentDraft, setIntentDraft] = useState('');
  const [intentError, setIntentError] = useState('');
  const folderRef = useRef(null);
  useEffect(() => { setS(readSaved()); setHydrated(true); }, []);
  useEffect(() => { if (!hydrated) return; try { localStorage.setItem(key, JSON.stringify(s)); setSaveError(false); } catch { setSaveError(true); } }, [s, hydrated]);
  const update = patch => setS(old => ({ ...old, ...patch }));
  const criterion = (id, patch) => setS(old => ({ ...old, criteria: old.criteria.map(c => c.id === id ? { ...c, ...patch } : c) }));
  const summary = useMemo(() => counts(s.criteria), [s.criteria]);
  const validIntent = s.problem.trim() && s.criteria.length > 0 && s.criteria.every(c => c.text.trim());
  const pendingFixes = s.criteria.filter(c => c.status === 'fix');
  const canSend = Boolean(chatDraft.trim()) && !intentDraft;
  const canReview = s.criteria.length > 0 && !summary.unchecked && !s.criteria.some(c => c.status === 'unverifiable' && !c.reason.trim());
  const selected = s.criteria.find(c => c.id === s.selected) || s.criteria[0];

  useEffect(() => {
    if (!hydrated || s.step !== 3 || s.run !== 'running') return;
    const timer = setTimeout(() => update({ run: 'done' }), 1700);
    return () => clearTimeout(timer);
  }, [hydrated, s.step, s.run]);
  useEffect(() => {
    if (!hydrated || s.step !== 4 || s.preview !== 'running') return;
    const timer = setTimeout(() => update({ preview: 'ready' }), 1400);
    return () => clearTimeout(timer);
  }, [hydrated, s.step, s.preview]);

  async function applyFolder(folder, readPackage) {
    update({ project: folder, detected: false });
    setFolderError('');
    if (!readPackage) return;
    try {
      const pkg = JSON.parse(await readPackage());
      const script = pkg.scripts?.dev ? 'dev' : pkg.scripts?.start ? 'start' : '';
      const command = script ? `npm run ${script}` : '';
      const port = pkg.scripts?.[script]?.match(/(?:--port|-p)\s*(\d+)/)?.[1] || (pkg.dependencies?.next || pkg.devDependencies?.next ? '3000' : '');
      setS(old => ({ ...old, command: old.command || command, port: old.port || port, detected: Boolean(command && port) }));
    } catch { /* Keep the selected folder and manually entered settings. */ }
  }

  async function chooseFolder(event) {
    const files = event.target.files;
    if (!files?.length) { setFolderError('선택된 폴더의 파일을 읽지 못했습니다. 다시 선택하거나 샘플 프로젝트를 사용해 주세요.'); return; }
    const folder = files[0].webkitRelativePath?.split('/')[0] || '선택한 프로젝트';
    const file = detectPackage(files);
    await applyFolder(folder, file ? () => file.text() : null);
  }

  async function selectFolder() {
    setFolderError('');
    if (!window.showDirectoryPicker) {
      folderRef.current?.setAttribute('webkitdirectory', '');
      folderRef.current?.click();
      return;
    }
    try {
      const directory = await window.showDirectoryPicker();
      await applyFolder(directory.name, async () => {
        const packageFile = await directory.getFileHandle('package.json');
        return (await packageFile.getFile()).text();
      });
    } catch (error) {
      if (error.name !== 'AbortError') setFolderError('폴더 선택을 완료하지 못했습니다. 다시 시도하거나 샘플 프로젝트를 선택해 주세요.');
    }
  }

  function startRun() { update({ step: 3, run: 'running' }); }
  function startPreview() { update({ step: 4, preview: 'running' }); }
  function goReview() { update({ step: 5, selected: s.criteria[0]?.id || 1 }); }
  function chooseStatus(c, status) { criterion(c.id, { status, reason: status === 'unverifiable' ? c.reason : '', feedback: status === 'fix' ? c.feedback : '', revisit: false }); }
  function navigateCriterion(c) {
    const raw = c.location.match(/https?:\/\/[^\s]+|\/[^\s,，]*/)?.[0] || '/';
    let path = '/';
    try { path = raw.startsWith('http') ? new URL(raw).pathname : raw; } catch { /* use sample home */ }
    const screen = /가입|회원|signup|register/.test(c.location + path) ? 'signup' : /목록|대시보드|dashboard/.test(c.location + path) ? 'dashboard' : 'home';
    update({ selected: c.id, previewPath: path, previewScreen: screen });
  }
  function sampleScreen(screen) { update({ previewScreen: screen, previewPath: screen === 'home' ? '/' : screen === 'signup' ? '/signup' : '/dashboard' }); }
  function submitFixes() {
    if (!canSend) return;
    const message = chatDraft.trim();
    setS(old => ({ ...old, step: 3, run: 'running', round: old.round + 1, requests: [...(old.requests || []), { round: old.round + 1, sentAt: new Date().toLocaleString('ko-KR'), message, url: `http://localhost:${old.port}${old.previewPath}`, screen: old.previewScreen, items: old.criteria.filter(c => c.status === 'fix').map(c => ({ id: c.id, feedback: message })) }], criteria: old.criteria.map(c => ({ ...c, status: 'unchecked', reason: '', feedback: '', revisit: true })) }));
    setChatDraft('');
    setIntentDraft('');
  }
  function finish() { if (summary.unchecked || ((summary.fix || summary.unverifiable) && !s.finishConfirmed)) return; update({ finished: true, finishedAt: new Date().toLocaleString('ko-KR') }); }
  function startNewWork() { setS({ ...initialState }); }
  function applyIntentDraft() {
    setS(old => ({ ...old, virtualIntent: intentDraft }));
    setIntentDraft('');
  }
  function downloadIntent() {
    const url = URL.createObjectURL(new Blob([intentMarkdown(s)], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'intent.md'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (!hydrated) return null;
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">↗</span><span>intent<span className="brand-light">loop</span><small>의도를 결과로, 확인은 직접</small></span></div><div className="side-caption">현재 작업</div><div className="project-card"><span className="project-icon">⌘</span><div><strong>{s.project || '프로젝트 미선택'}</strong><small>{s.project ? '로컬 프로젝트 · 프로토타입' : '폴더를 선택해 시작하세요'}</small></div></div><div className="side-caption flow-caption">작업 흐름</div><nav aria-label="작업 단계">{steps.map((name, i) => <div key={name} className={`nav-step ${s.step === i + 1 ? 'active' : s.step > i + 1 ? 'done' : ''}`}><span className="nav-num">{s.step > i + 1 ? '✓' : i + 1}</span>{name}</div>)}</nav><div className="side-bottom"><span className="demo-dot" /> 프로토타입 · 목 데이터 사용</div></aside><main className="main"><header className="topbar"><div className="breadcrumb">작업 흐름 <span>/</span> <strong>{steps[s.step - 1]}</strong></div><div className="top-meta"><span className="demo-pill">DEMO</span><span>{saveError ? '저장 실패 · 브라우저 저장 공간을 확인하세요' : '로컬에 자동 저장'}</span></div></header><div className="content">
    {s.step === 1 && <>{head(1, '작업할 프로젝트를 선택하세요', '에이전트가 참고할 코드베이스와 미리보기 실행 방법을 확인합니다.')}<div className="notice gray">ℹ️　프로토타입에서는 폴더 이름과 실행 설정만 읽습니다. 실제 파일 수정이나 앱 실행은 하지 않습니다.</div><div className="card card-pad"><div className="card-title">코드베이스 폴더</div><div className="folder-drop"><div><strong>{s.project || '프로젝트 폴더를 선택해 주세요'}</strong><small>{s.project ? s.detected ? '선택된 폴더의 package.json을 확인했습니다.' : '폴더를 선택했습니다. 실행 정보를 확인해 주세요.' : 'Claude Code에서 프로젝트 폴더를 여는 것과 같은 단계입니다.'}</small></div><div className="folder-actions"><input ref={folderRef} type="file" webkitdirectory="" directory="" multiple className="hidden" onClick={e => { e.currentTarget.value = ''; }} onChange={chooseFolder} /><button className="button" onClick={selectFolder}>폴더 선택</button><button className="button ghost" onClick={() => update({ project: 'sample-project', command: 'npm run dev', port: '3000', detected: true })}>샘플 프로젝트 사용</button></div></div></div>{folderError && <div className="notice warning">{folderError}</div>}<div className="card card-pad" style={{ marginTop: 18 }}><div className="card-title">미리보기 실행 정보 <span className="badge">확인만 해주세요</span></div>{s.detected && <div className="detect-row"><span className="badge">자동 감지</span> package.json에서 실행 정보를 찾았어요.</div>}{s.project && !s.detected && <div className="notice warning">실행 정보를 감지하지 못했어요. 명령과 포트를 직접 입력해 주세요.</div>}<div className="grid-2"><Field label="실행 명령" hint="앱을 실행할 때 사용할 명령" value={s.command} onChange={v => update({ command: v })} placeholder="예: npm run dev" /><Field label="포트" hint="미리보기 주소에 사용할 포트" value={s.port} onChange={v => update({ port: v })} placeholder="예: 3000" /></div></div><div className="footer-actions"><div /><div className="action-right"><button className="button primary" disabled={!s.project || !s.command.trim() || !/^\d+$/.test(s.port)} onClick={() => update({ step: 2 })}>이 프로젝트로 시작 →</button>{(!s.project || !s.command.trim() || !/^\d+$/.test(s.port)) && <p className="validation">{!s.project ? '프로젝트 폴더를 선택해 주세요.' : !s.command.trim() ? '실행 명령을 입력해 주세요.' : '포트는 숫자로 입력해 주세요.'}</p>}</div></div></>}

    {s.step === 2 && <>{head(2, '원하는 결과를 적어주세요', '에이전트가 개발할 방향과 직접 확인할 완료 기준을 정합니다.')}<div className="intent-layout"><div className="card card-pad"><Field label="해결할 문제 *" hint="지금 무엇이 불편하거나 없나요?" value={s.problem} onChange={v => update({ problem: v })} placeholder="예: 사용자가 할 일을 여러 곳에 적어 놓아 우선순위를 놓칩니다." multiline /><Field label="기대하는 결과" hint="끝나면 사용자가 무엇을 할 수 있게 되나요?" value={s.outcome} onChange={v => update({ outcome: v })} placeholder="예: 한 화면에서 오늘 할 일을 보고 완료할 수 있습니다." multiline /><div className="field"><div className="field-label">범위</div><p className="hint">이번에 할 것과 하지 않을 것을 적어주세요.</p><div className="scope-grid"><input className="text-input" value={s.include} onChange={e => update({ include: e.target.value })} placeholder="포함: 이번에 할 것" /><input className="text-input" value={s.exclude} onChange={e => update({ exclude: e.target.value })} placeholder="제외: 이번에 하지 않을 것" /><input className="text-input full" value={s.protect} onChange={e => update({ protect: e.target.value })} placeholder="지켜야 할 것: 디자인 시스템, 수정 금지 파일 등" /></div></div><div className="field"><div className="field-label">완료 기준 *</div><p className="hint">화면에서 직접 보고 확인할 수 있는 문장으로 적어주세요.</p>{s.criteria.map(c => <div className="criteria-edit" key={c.id}><div className="criteria-edit-head"><strong>C{c.id}</strong>{s.criteria.length > 1 && <button className="button ghost small" onClick={() => update({ criteria: s.criteria.filter(x => x.id !== c.id) })}>삭제</button>}</div><div className="criteria-edit-grid"><input className="text-input" aria-label={`C${c.id} 확인할 내용`} value={c.text} onChange={e => criterion(c.id, { text: e.target.value })} placeholder="확인할 내용" /><input className="text-input" aria-label={`C${c.id} 확인 위치와 상태`} value={c.location} onChange={e => criterion(c.id, { location: e.target.value })} placeholder="확인 위치·상태" /><select className="select" aria-label={`C${c.id} 화면 확인 여부`} value={c.visible ? 'yes' : 'no'} onChange={e => criterion(c.id, { visible: e.target.value === 'yes', status: e.target.value === 'yes' ? 'unchecked' : 'unverifiable', reason: e.target.value === 'yes' ? '' : '화면만으로 확인할 수 없음' })}><option value="yes">화면 확인 가능</option><option value="no">화면 확인 불가</option></select></div>{vagueWords.test(c.text) && <div className="vague">화면에서 확인하기 어려워요. 이렇게 바꿔볼까요?<br /><strong>예: 지정한 화면에 결과가 표시되고 버튼을 누르면 다음 상태로 바뀐다.</strong></div>}</div>)}<button className="button small" onClick={() => setS(old => ({ ...old, nextId: old.nextId + 1, criteria: [...old.criteria, { id: old.nextId, text: '', location: '', visible: true, status: 'unchecked', reason: '', feedback: '', revisit: false }] }))}>+ 기준 추가</button></div><Field label="아직 정하지 못한 사항" hint="정해지지 않은 것은 임시 가정과 함께 적어주세요." value={s.unknown} onChange={v => update({ unknown: v })} placeholder="예: 로그인 방식 — 임시 가정: 이메일 로그인" multiline /></div><div className="card card-pad raw-card"><div className="card-title">intent.md 원문 보기 <span className="badge">실시간 반영</span></div><pre>{intentMarkdown(s)}</pre><button className="button small" style={{ marginTop: 12 }} onClick={downloadIntent}>intent.md 내려받기</button></div></div><div className="footer-actions"><button className="button ghost" onClick={() => update({ step: 1 })}>← 프로젝트 설정</button><div className="action-right"><button className="button primary" disabled={!validIntent} onClick={startRun}>에이전트에게 개발 맡기기 →</button>{!validIntent && <p className="validation">해결할 문제와 완료 기준 1개 이상의 내용을 입력해 주세요.</p>}</div></div></>}

    {s.step === 3 && <>{head(3, s.round ? '수정 작업을 진행하고 있어요' : '에이전트가 개발하고 있어요', '진행 상태와 로그를 확인할 수 있습니다.')}<div className="notice warning">목 데이터 시뮬레이션입니다. 실제 에이전트는 호출하지 않습니다.</div><div className="revision-layout"><div className="card card-pad"><div className="status-hero">{s.run === 'running' && <span className="spinner" />}<div><b>{s.run === 'running' ? '작업 진행 중' : s.run === 'done' ? '개발이 끝났어요' : s.run === 'failed' ? '개발에 실패했어요' : '작업을 중단했어요'}</b><p>{s.run === 'failed' ? '샘플 오류: 의존성 설치에 실패했습니다.' : s.run === 'done' ? '이제 앱 미리보기를 준비할 수 있어요.' : '목 데이터로 개발 흐름을 보여주고 있어요.'}</p></div></div><div className="progress-list">{['Intent와 프로젝트 분석', '화면과 동작 구현', '결과 정리'].map((v, i) => <div className={`progress-row ${s.run === 'running' && i === 1 ? 'current' : ''}`} key={v}><span className="progress-icon">{s.run === 'done' || i === 0 ? '✓' : i + 1}</span><strong>{v}</strong></div>)}</div><div className="card-title">진행 로그 <span className="badge">샘플 로그</span></div><div className="log"><span>$</span> intent.md 읽기 완료<br /><span>$</span> {s.round ? '수정 요청 분석 중' : '프로젝트 구조 분석 중'}<br /><span>$</span> 샘플 앱 화면 준비 {s.run === 'done' ? '완료' : s.run === 'failed' ? '실패' : '중...'}</div><div className="footer-actions"><div>{s.run === 'running' && <><button className="button danger" onClick={() => update({ run: 'stopped' })}>중단</button><button className="button ghost small" onClick={() => update({ run: 'failed' })}>실패 상황 보기</button></>}{['failed', 'stopped'].includes(s.run) && <button className="button" onClick={() => update({ run: 'running' })}>다시 시도</button>}</div>{s.run === 'done' && <button className="button primary" onClick={startPreview}>실제 앱 미리보기 준비 →</button>}</div></div><aside className="card card-pad revision-intent"><div className="card-title">가상 intent.md <span className="badge">개발 기준</span></div><p className="hint">에이전트가 이번 작업에 참고하는 현재 Intent입니다.</p><pre>{intentMarkdown(s)}</pre></aside></div></>}

    {s.step === 4 && <>{head(4, '앱 미리보기를 준비해요', '준비가 끝나면 완료 기준을 직접 검토할 수 있습니다.')}<div className="notice warning">이 화면은 샘플 앱입니다. 실제 앱 실행은 프로토타입 승인 후 연결합니다.</div><div className="revision-layout"><div className="card card-pad"><div className="status-hero">{s.preview === 'running' && <span className="spinner" />}<div><b>{s.preview === 'running' ? '앱 실행 준비 중' : s.preview === 'ready' ? '샘플 앱이 준비됐어요' : '앱 실행에 실패했어요'}</b><p>{s.preview === 'failed' ? '샘플 오류: 지정한 포트에서 앱을 열 수 없습니다.' : `실행 명령 ${s.command} · 포트 ${s.port}`}</p></div></div><div className="card-title">실행 로그 <span className="badge">샘플 로그</span></div><div className="log"><span>$</span> {s.command}<br /><span>$</span> http://localhost:{s.port} {s.preview === 'failed' ? '연결 실패' : s.preview === 'ready' ? '준비 완료' : '준비 중...'}</div>{s.preview === 'ready' && <div style={{ marginTop: 18 }}><Preview s={s} onScreen={sampleScreen} /></div>}<div className="footer-actions"><div>{s.preview === 'running' && <button className="button ghost small" onClick={() => update({ preview: 'failed' })}>실패 상황 보기</button>}{s.preview === 'failed' && <button className="button" onClick={() => update({ preview: 'running' })}>다시 실행</button>}</div>{s.preview === 'ready' && <button className="button primary" onClick={goReview}>완료 기준 검토하기 →</button>}</div></div><aside className="card card-pad revision-intent"><div className="card-title">가상 intent.md <span className="badge">개발 기준</span></div><p className="hint">현재 개발 기준과 완료 기준을 확인할 수 있습니다.</p><pre>{intentMarkdown(s)}</pre></aside></div></>}

    {s.step === 5 && <>{head(5, '완료 기준을 직접 확인하세요', '샘플 앱을 살펴보고 각 기준의 결과를 선택해 주세요.')}<div className="notice warning">샘플 앱 화면입니다. 실제 앱 화면이나 성능을 증명하지 않습니다.</div><div className="summary-strip"><span><b>{summary.unchecked}</b> 미확인</span><span><b>{summary.pass}</b> 통과</span><span><b>{summary.fix}</b> 수정 필요</span><span><b>{summary.unverifiable}</b> 확인 불가</span></div><div className="review-layout"><div className="review-preview"><div className="card card-pad"><div className="card-title">앱 미리보기 <span className="badge yellow">샘플 앱</span></div><Preview s={s} onScreen={sampleScreen} /><p className="hint" style={{ marginTop: 12 }}>기준을 선택한 뒤 ‘이 화면으로 이동’을 누르세요. 샘플 앱에서 해당 위치를 보여줍니다.</p></div></div><div className="review-list">{s.criteria.map(c => <div key={c.id} className={`review-card ${selected?.id === c.id ? 'selected' : ''}`} onClick={() => update({ selected: c.id })}><div className="review-card-head"><span className="badge">C{c.id}</span><span className={`badge ${c.status === 'pass' ? 'green' : c.status === 'fix' ? 'red' : c.status === 'unverifiable' ? 'yellow' : ''}`}>{names[c.status]}</span></div><h3>{c.text}</h3><p>확인 위치·상태: {c.location}</p>{c.revisit && <div className="assumption">{c.status === 'pass' ? '수정 이후 재확인 권장' : '다시 확인'}</div>}{s.unknown.trim() && <div className="assumption">에이전트가 이렇게 가정했어요: {s.unknown}</div>}<button className="button small" onClick={e => { e.stopPropagation(); navigateCriterion(c); }}>이 화면으로 이동 ↗</button><div className="review-options">{['pass', 'fix', 'unverifiable'].map(status => <button key={status} className={`choice ${c.status === status ? `active ${status}` : ''}`} onClick={e => { e.stopPropagation(); chooseStatus(c, status); }} disabled={!c.visible && status !== 'unverifiable'}>{names[status]}</button>)}</div>{c.status === 'unverifiable' && <input className="text-input reason-input" aria-label={`C${c.id} 확인 불가 사유`} value={c.reason} onClick={e => e.stopPropagation()} onChange={e => criterion(c.id, { reason: e.target.value })} placeholder="확인 불가 사유를 적어주세요" />}</div>)}</div></div><div className="footer-actions"><div /><div className="action-right">{!pendingFixes.length && <button className="button" disabled={!canReview} onClick={() => update({ step: 6 })}>바이브코딩으로 더 다듬기</button>}<button className="button primary" disabled={!canReview} onClick={() => update({ step: pendingFixes.length ? 6 : 7 })}>{pendingFixes.length ? '수정 요청 모으기' : '종료 내용 확인'} →</button>{!canReview && <p className="validation">모든 완료 기준을 확인하고 결과를 선택해 주세요. 확인 불가라면 사유도 입력해야 합니다.</p>}</div></div></>}

    {s.step === 6 && <>{head(6, '에이전트와 함께 다듬기', '완료 기준 수정과 자유 개선을 대화로 요청하세요.')}<div className="revision-layout"><section className="card card-pad"><div className="card-title">수정 대화 <span className="badge">목 데이터</span></div><div className="chat-history">{s.requests.length ? s.requests.map(request => <div key={request.round}><div className="chat-message user-message"><small>나 · {request.sentAt}</small><p>{request.message || request.items.map(item => item.feedback).join('\n')}</p><div className="chat-attachments">{request.items.map(item => <span className="badge" key={item.id}>C{item.id} · 수정 대상</span>)}<span className="badge">현재 미리보기 화면 첨부</span></div></div><div className="chat-message agent-message"><small>에이전트</small><p>요청과 완료 기준을 반영해 수정 작업을 시작합니다. 완료되면 다시 확인할 수 있도록 기준을 미확인으로 돌렸습니다.</p></div></div>) : <div className="chat-message agent-message"><small>에이전트</small><p>{pendingFixes.length ? '수정이 필요한 기준을 확인했습니다. 기대한 동작과 실제 화면, 원하는 변경을 편하게 적어주세요.' : '화면이나 동작을 자연어로 요청하면 개발 문서에 반영해 다음 작업에 전달합니다.'}</p></div>}</div><div className="revision-targets"><b>이번 수정 대상</b>{pendingFixes.map(c => <div className="summary-item" key={c.id}><b>C{c.id}</b><span>{c.text}</span></div>)}{!pendingFixes.length && <p>기준 외의 화면·동작 개선도 자연어로 요청할 수 있습니다.</p>}</div><label className="field chat-compose"><span className="field-label">수정 지시</span><textarea className="textarea" value={chatDraft} onChange={e => setChatDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && canSend) { e.preventDefault(); submitFixes(); } }} placeholder="예: 이 화면의 여백을 줄이고, 가입 버튼을 누르면 이메일 입력 폼이 열리도록 수정해줘." /><span className="hint">Enter 전송 · Shift+Enter 줄바꿈 · 수정 대상 기준과 현재 화면 정보가 함께 전달됩니다.</span></label><div className="action-right"><button className="button primary" disabled={!canSend} onClick={submitFixes}>개발 지시 보내기 →</button>{!canSend && <p className="validation">{intentDraft ? '문서 변경을 먼저 반영해 주세요.' : '수정 지시를 입력해 주세요.'}</p>}</div></section><aside className="card card-pad revision-intent"><div className="card-title">가상 intent.md <span className="badge">요청 반영</span></div><p className="hint">템플릿 형식의 가상 문서입니다. 내용을 편집한 뒤 반영하면 완료 기준에도 동기화됩니다.</p><textarea className="textarea intent-editor" aria-label="가상 intent.md 편집" style={{ minHeight: 410, maxHeight: 640, overflowY: 'auto', whiteSpace: 'pre', fontFamily: 'Consolas, monospace', background: '#172f39', color: '#c5d7d7', lineHeight: 1.7 }} value={intentDraft || intentMarkdown(s)} onChange={e => { setIntentDraft(e.target.value); setIntentError(''); }} /><button className="button small" style={{ marginTop: 12 }} disabled={!intentDraft} onClick={applyIntentDraft}>문서 변경 반영</button>{intentError && <p className="validation">{intentError}</p>}</aside></div><div className="footer-actions"><button className="button ghost" onClick={goReview}>← 검토로 돌아가기</button></div></>}

    {s.step === 7 && <>{head(7, s.finished ? '작업을 종료했어요' : '작업을 종료하기 전에 확인하세요', '기준별 결과를 확인하고 직접 작업을 종료합니다.')}<div className="card card-pad">{s.finished ? <div className="finished"><span className="check">✓</span><h2>작업이 종료됐어요</h2><p>사용자가 {s.finishedAt}에 직접 종료했습니다.</p><button className="button primary" onClick={startNewWork}>새 작업 시작</button></div> : null}{['pass', 'fix', 'unverifiable', 'unchecked'].map(status => <div className="summary-group" key={status}><h3>{names[status]} · {summary[status]}</h3>{s.criteria.filter(c => c.status === status).length ? s.criteria.filter(c => c.status === status).map(c => <div className="summary-item" key={c.id}><b>C{c.id}</b><div>{c.text}{status === 'unverifiable' && <small>사유: {c.reason || '사유 미입력'}</small>}</div></div>) : <div className="empty">해당 기준이 없습니다.</div>}</div>)}{!s.finished && (summary.fix || summary.unverifiable) > 0 && <div className="confirm-box"><label><input type="checkbox" checked={s.finishConfirmed} onChange={e => update({ finishConfirmed: e.target.checked })} /> 수정 필요 또는 확인 불가 기준이 남아 있습니다. 이 상태로 종료할게요. 이 선택을 종료 기록에 남깁니다.</label></div>}</div>{!s.finished && <div className="footer-actions"><button className="button ghost" onClick={goReview}>← 검토로 돌아가기</button><div className="action-right"><button className="button primary" disabled={Boolean(summary.unchecked || s.criteria.some(c => c.status === 'unverifiable' && !c.reason.trim()) || ((summary.fix || summary.unverifiable) && !s.finishConfirmed))} onClick={finish}>작업 종료</button>{summary.unchecked > 0 && <p className="validation">미확인 기준 {summary.unchecked}개를 먼저 확인해 주세요.</p>}{s.criteria.some(c => c.status === 'unverifiable' && !c.reason.trim()) && <p className="validation">확인 불가 사유를 입력해 주세요.</p>}</div></div>}</>}
  </div></main></div>;
}

function Preview({ s, onScreen }) {
  function openWindow() {
    const windowRef = window.open('', '_blank');
    if (!windowRef) return;
    const title = s.previewScreen === 'signup' ? '새 계정 만들기' : s.previewScreen === 'dashboard' ? '내 작업 목록' : '해야 할 일을, 한곳에서.';
    windowRef.document.write(`<!doctype html><html lang="ko"><meta charset="utf-8"><title>샘플 앱</title><style>body{font-family:Arial,sans-serif;margin:0;color:#234049;background:#f7fbfb}header{padding:22px 7%;background:#fff;border-bottom:1px solid #e2e8e8;font-weight:bold}main{max-width:600px;margin:90px auto;text-align:center;padding:20px}h1{font-size:32px}p{color:#728b90}</style><header>모아 · 샘플 앱</header><main><h1>${title}</h1><p>프로토타입 미리보기입니다. 실제 앱 실행 화면은 추후 연결합니다.</p></main></html>`);
    windowRef.document.close();
  }
  return <div className="preview-frame"><div className="preview-bar"><span className="dots">•••</span><span className="url">http://localhost:{s.port}{s.previewPath}</span><button className="button ghost small" onClick={openWindow}>새 창에서 열기 ↗</button><span className="badge">목 데이터</span></div><SampleApp screen={s.previewScreen} onScreen={onScreen} /></div>;
}

