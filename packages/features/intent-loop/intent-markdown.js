function revisionBlock(request) {
  const targets = request.items?.length ? `${request.items.map(item => `C${item.id}`).join(', ')} 기준 수정` : '자유 개선 요청';
  return `# 이번 수정 요청\n- 대상: ${targets}\n- ${request.message}`;
}

function formatProtect(text) {
  if (!text.trim()) return '';
  if (!text.includes('\n')) return ` ${text}`;
  return `\n${text.split('\n').map(line => `   ${line}`).join('\n')}`;
}

export function withRevision(markdown, request) {
  const stripped = markdown.replace(/\n*# 이번 수정 요청\s*\n[\s\S]*?(?=\n# |(?![\s\S]))/, '');
  return `${stripped}\n\n${revisionBlock(request)}`;
}

export function intentMarkdown(state) {
  if (state.virtualIntent !== undefined) return state.virtualIntent;
  const request = state.requests?.at(-1);
  const revision = request ? `\n\n${revisionBlock(request)}` : '';
  const criteria = state.criteria.map(c => `- [C${c.id}] ${c.text} — 확인 위치/상태: ${c.location} — 화면 확인 ${c.visible ? '가능' : '불가(사유: 화면만으로 확인할 수 없음)'}`).join('\n');
  return `# 해결할 문제\n${state.problem || '<지금 무엇이 문제인지, 왜 필요한지>'}\n\n# 기대하는 결과\n${state.outcome || '<작업이 끝나면 사용자가 얻는 경험>'}\n\n# 범위\n- 포함: ${state.include}\n- 제외: ${state.exclude}\n- 지켜야 할 것:${formatProtect(state.protect)}\n\n# 완료 기준\n${criteria}\n\n# 아직 정하지 못한 사항\n- ${state.unknown || '<결정이 필요한 것> — 임시 가정: <에이전트가 적용할 가정>'}${revision}`;
}

function section(markdown, title) {
  const match = markdown.match(new RegExp(`^# ${title}\\s*\\n([\\s\\S]*?)(?=\\n# |(?![\\s\\S]))`, 'm'));
  return match?.[1].trim() ?? null;
}

function scopeValue(scope, key) {
  const match = scope.match(new RegExp(`^- ${key}:[ \\t]*([\\s\\S]*?)(?=\\n- |(?![\\s\\S]))`, 'm'));
  return match ? match[1].replace(/^ {1,3}/gm, '').trim() : '';
}

function parseCriteria(text, current) {
  return text.split('\n').flatMap(line => {
    const match = line.match(/^- \[C(\d+)\]\s*(.*?)\s+— 확인 위치\/상태:\s*(.*?)\s+— 화면 확인 (가능|불가.*)$/);
    if (!match) return [];
    const [, rawId, rawText, rawLocation, visibility] = match;
    const id = Number(rawId);
    const text = rawText.trim();
    const location = rawLocation.trim();
    const visible = visibility === '가능';
    const previous = current.criteria.find(item => item.id === id);
    const unchanged = previous && previous.text === text && previous.location === location && previous.visible === visible;
    return [{ id, text, location, visible, status: unchanged ? previous.status : 'unchecked', reason: unchanged ? previous.reason : '', feedback: '', revisit: !unchanged }];
  });
}

function syncRequests(requests, requestText) {
  if (requestText === null) return requests.slice(0, -1);
  if (!requests.length) return requests;
  const message = requestText.replace(/^- 대상:.*\n/, '').replace(/^- /, '');
  return [...requests.slice(0, -1), { ...requests.at(-1), message }];
}

export function parseIntentMarkdown(markdown, current) {
  const titles = ['해결할 문제', '기대하는 결과', '범위', '완료 기준', '아직 정하지 못한 사항'];
  const [problem, outcome, scope, criteriaText, unknown] = titles.map(title => section(markdown, title));
  if ([problem, outcome, scope, criteriaText, unknown].some(value => value === null)) return null;
  const criteria = parseCriteria(criteriaText, current);
  if (!problem.trim() || !criteria.length || criteria.some(item => !item.text.trim())) return null;
  return {
    problem, outcome, include: scopeValue(scope, '포함'), exclude: scopeValue(scope, '제외'), protect: scopeValue(scope, '지켜야 할 것'),
    criteria, nextId: Math.max(0, ...criteria.map(item => item.id)) + 1,
    unknown: unknown.replace(/^-\s*/, ''), requests: syncRequests(current.requests || [], section(markdown, '이번 수정 요청')),
  };
}
