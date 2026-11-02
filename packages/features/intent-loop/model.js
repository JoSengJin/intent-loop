export const steps = ['프로젝트 설정', 'Intent 작성', '에이전트 개발', '실제 앱 미리보기', '완료 기준별 검토', '수정 요청 및 재검토', '종료'];
export const initialState = {
  step: 1, project: '', command: '', port: '', detected: false, problem: '', outcome: '', include: '', exclude: '', protect: '', unknown: '',
  criteria: [{ id: 1, text: '', location: '', visible: true, status: 'unchecked', reason: '', feedback: '', revisit: false }],
  nextId: 2, run: 'idle', preview: 'idle', round: 0, selected: 1, previewPath: '/', previewScreen: 'home', requests: [], finished: false, finishConfirmed: false, finishedAt: '',
};

export function intentMarkdown(state) {
  if (state.virtualIntent !== undefined) return state.virtualIntent;
  const request = state.requests?.at(-1);
  const targets = request?.items?.length ? `${request.items.map(item => `C${item.id}`).join(', ')} 기준 수정` : '자유 개선 요청';
  const revision = request ? `\n\n# 이번 수정 요청\n- 대상: ${targets}\n- ${request.message}` : '';
  return `# 해결할 문제\n${state.problem || '<지금 무엇이 문제인지, 왜 필요한지>'}\n\n# 기대하는 결과\n${state.outcome || '<작업이 끝나면 사용자가 얻는 경험>'}\n\n# 범위\n- 포함: ${state.include}\n- 제외: ${state.exclude}\n- 지켜야 할 것: ${state.protect}\n\n# 완료 기준\n${state.criteria.map(c => `- [C${c.id}] ${c.text} — 확인 위치/상태: ${c.location} — 화면 확인 ${c.visible ? '가능' : '불가(사유: 화면만으로 확인할 수 없음)'}`).join('\n')}\n\n# 아직 정하지 못한 사항\n- ${state.unknown || '<결정이 필요한 것> — 임시 가정: <에이전트가 적용할 가정>'}${revision}`;
}

export function parseIntentMarkdown(markdown, current) {
  const section = title => {
    const match = markdown.match(new RegExp(`^# ${title}\\s*\\n([\\s\\S]*?)(?=\\n# |$)`, 'm'));
    return match?.[1].trim() ?? null;
  };
  const problem = section('해결할 문제');
  const outcome = section('기대하는 결과');
  const scope = section('범위');
  const criteriaText = section('완료 기준');
  const unknown = section('아직 정하지 못한 사항');
  if ([problem, outcome, scope, criteriaText, unknown].some(value => value === null)) return null;
  const requestText = section('이번 수정 요청');
  const criteria = criteriaText.split('\n').flatMap(line => {
    const match = line.match(/^- \[C(\d+)\]\s*(.*?)\s+— 확인 위치\/상태:\s*(.*?)\s+— 화면 확인 (가능|불가.*)$/);
    if (!match) return [];
    const id = Number(match[1]);
    const text = match[2].trim();
    const location = match[3].trim();
    const visible = match[4] === '가능';
    const previous = current.criteria.find(item => item.id === id);
    const unchanged = previous && previous.text === text && previous.location === location && previous.visible === visible;
    return [{ id, text, location, visible, status: unchanged ? previous.status : 'unchecked', reason: unchanged ? previous.reason : '', feedback: '', revisit: !unchanged }];
  });
  if (!problem.trim() || !criteria.length || criteria.some(item => !item.text.trim())) return null;
  const value = key => scope.match(new RegExp(`^- ${key}:\\s*(.*)$`, 'm'))?.[1] || '';
  let requests = current.requests || [];
  if (requestText === null) requests = requests.slice(0, -1);
  else if (requests.length) {
    const message = requestText.replace(/^- 대상:.*\n/, '').replace(/^- /, '');
    requests = [...requests.slice(0, -1), { ...requests.at(-1), message }];
  }
  return {
    problem, outcome, include: value('포함'), exclude: value('제외'), protect: value('지켜야 할 것'),
    criteria, nextId: Math.max(0, ...criteria.map(item => item.id)) + 1,
    unknown: unknown.replace(/^-\s*/, ''), requests,
  };
}

export function counts(criteria) {
  return { unchecked: criteria.filter(c => c.status === 'unchecked').length, pass: criteria.filter(c => c.status === 'pass').length, fix: criteria.filter(c => c.status === 'fix').length, unverifiable: criteria.filter(c => c.status === 'unverifiable').length };
}

export function detectPackage(files) {
  const entry = [...files].find(file => file.webkitRelativePath?.split('/').length === 2 && file.name === 'package.json');
  return entry;
}
