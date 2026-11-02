const LINE = /^- (?:\[(?:C(\d+)|[ xX]?)\]\s*)?(.*?)(?:\s+— 확인 위치\/상태:\s*(.*?))?(?:\s+— 화면 확인 (가능|불가.*))?$/;

function section(markdown, title) {
  const match = markdown.match(new RegExp(`^# ${title}\\s*\\n([\\s\\S]*?)(?=\\n# |(?![\\s\\S]))`, 'm'));
  return match?.[1].trim() ?? null;
}

function scopeValue(scope, key) {
  const match = scope.match(new RegExp(`^- ${key}:[ \\t]*([\\s\\S]*?)(?=\\n- |(?![\\s\\S]))`, 'm'));
  return match ? match[1].replace(/^ {1,3}/gm, '').trim() : '';
}

// `- [C2] 내용 — 확인 위치/상태: … — 화면 확인 가능` 전체 형식뿐 아니라 `- 내용`, `- [ ] 내용`도 완료 기준으로 읽는다.
function parseLine(line) {
  const match = line.match(LINE);
  if (!match || !match[2].trim()) return [];
  const [, rawId, text, location = '', visibility = '가능'] = match;
  return [{ id: rawId ? Number(rawId) : null, text: text.trim(), location: location.trim(), visible: visibility === '가능' }];
}

function assignIds(rows, current) {
  const used = new Set(rows.map(row => row.id).filter(Boolean));
  let next = Math.max(0, ...current.criteria.map(c => c.id), ...used) + 1;
  return rows.map(row => {
    if (row.id) return row;
    const same = current.criteria.find(c => c.text === row.text && !used.has(c.id));
    if (same) { used.add(same.id); return { ...row, id: same.id }; }
    return { ...row, id: next++ };
  });
}

function toCriteria(rows, current) {
  return rows.map(row => {
    const previous = current.criteria.find(c => c.id === row.id);
    const unchanged = previous && previous.text === row.text && previous.location === row.location && previous.visible === row.visible;
    return { ...row, status: unchanged ? previous.status : 'unchecked', reason: unchanged ? previous.reason : '', feedback: '', revisit: !unchanged };
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
  const rows = criteriaText.split('\n').flatMap(parseLine);
  if (!problem.trim() || !rows.length) return null;
  const criteria = toCriteria(assignIds(rows, current), current);
  return {
    problem, outcome, include: scopeValue(scope, '포함'), exclude: scopeValue(scope, '제외'), protect: scopeValue(scope, '지켜야 할 것'),
    criteria, nextId: Math.max(0, ...criteria.map(item => item.id)) + 1,
    unknown: unknown.replace(/^-\s*/, ''), requests: syncRequests(current.requests || [], section(markdown, '이번 수정 요청')),
  };
}
