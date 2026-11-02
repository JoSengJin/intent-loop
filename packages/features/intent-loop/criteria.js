import { newCriterion } from './model';

export function patchCriterion(state, id, patch) {
  return { ...state, criteria: state.criteria.map(c => (c.id === id ? { ...c, ...patch } : c)) };
}

export function addCriterion(state) {
  return { ...state, nextId: state.nextId + 1, criteria: [...state.criteria, newCriterion(state.nextId)] };
}

export function removeCriterion(state, id) {
  return { ...state, criteria: state.criteria.filter(c => c.id !== id) };
}

export function setCriterionStatus(state, id, status) {
  const c = state.criteria.find(item => item.id === id);
  if (!c) return state;
  return patchCriterion(state, id, { status, reason: status === 'unverifiable' ? c.reason : '', feedback: status === 'fix' ? c.feedback : '', revisit: false });
}

export function resolveTarget(c) {
  const raw = c.location.match(/https?:\/\/[^\s]+|\/[^\s,，]*/)?.[0] || '/';
  let path = '/';
  try { path = raw.startsWith('http') ? new URL(raw).pathname : raw; } catch { /* use sample home */ }
  const text = c.location + path;
  const screen = /가입|회원|signup|register/.test(text) ? 'signup' : /목록|대시보드|dashboard/.test(text) ? 'dashboard' : 'home';
  return { path, screen };
}

export function selectCriterion(state, id) {
  const c = state.criteria.find(item => item.id === id);
  if (!c) return state;
  const { path, screen } = resolveTarget(c);
  return { ...state, selected: id, previewPath: path, previewScreen: screen };
}

export function showScreen(state, screen) {
  const paths = { home: '/', signup: '/signup', dashboard: '/dashboard' };
  return { ...state, previewScreen: screen, previewPath: paths[screen] };
}
