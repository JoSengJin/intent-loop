import { newCriterion } from './model';
import type { Criterion, CriterionStatus, IntentState, ScreenName } from './types';

export function patchCriterion(state: IntentState, id: number, patch: Partial<Criterion>): IntentState {
  return { ...state, criteria: state.criteria.map(c => (c.id === id ? { ...c, ...patch } : c)) };
}

export function addCriterion(state: IntentState): IntentState {
  return { ...state, nextId: state.nextId + 1, criteria: [...state.criteria, newCriterion(state.nextId)] };
}

export function removeCriterion(state: IntentState, id: number): IntentState {
  return { ...state, criteria: state.criteria.filter(c => c.id !== id) };
}

export function setCriterionStatus(state: IntentState, id: number, status: CriterionStatus): IntentState {
  const c = state.criteria.find(item => item.id === id);
  if (!c) return state;
  return patchCriterion(state, id, { status, reason: status === 'unverifiable' ? c.reason : '', feedback: status === 'fix' ? c.feedback : '', revisit: false });
}

export function resolveTarget(c: Criterion): { path: string; screen: ScreenName } {
  const raw = c.location.match(/https?:\/\/[^\s]+|\/[^\s,，]*/)?.[0] || '/';
  let path = '/';
  try { path = raw.startsWith('http') ? new URL(raw).pathname : raw; } catch { /* use sample home */ }
  const text = c.location + path;
  const screen: ScreenName = /가입|회원|signup|register/.test(text) ? 'signup' : /목록|대시보드|dashboard/.test(text) ? 'dashboard' : 'home';
  return { path, screen };
}

export function selectCriterion(state: IntentState, id: number): IntentState {
  const c = state.criteria.find(item => item.id === id);
  if (!c) return state;
  const { path, screen } = resolveTarget(c);
  return { ...state, selected: id, previewPath: path, previewScreen: screen };
}

export function showScreen(state: IntentState, screen: ScreenName): IntentState {
  const paths: Record<ScreenName, string> = { home: '/', signup: '/signup', dashboard: '/dashboard' };
  return { ...state, previewScreen: screen, previewPath: paths[screen] };
}
