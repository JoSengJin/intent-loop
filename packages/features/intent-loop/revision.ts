import { withRevision } from './intent-markdown';
import { parseIntentMarkdown } from './intent-parser';
import type { IntentState, RevisionRequest } from './types';

export function startBuild(state: IntentState): IntentState {
  return { ...state, step: 3, run: 'running', preview: 'idle', virtualIntent: undefined, intentSynced: true };
}

export function submitRevision(state: IntentState, message: string): IntentState {
  const text = message.trim();
  const round = state.round + 1;
  const request: RevisionRequest = {
    round, sentAt: new Date().toLocaleString('ko-KR'), message: text,
    url: `http://localhost:${state.port}${state.previewPath}`, screen: state.previewScreen,
    items: state.criteria.filter(c => c.status === 'fix').map(c => ({ id: c.id, feedback: text })),
  };
  const next: IntentState = {
    ...state, run: 'running', preview: 'idle', round, requests: [...(state.requests || []), request],
    criteria: state.criteria.map(c => ({ ...c, status: 'unchecked', reason: '', feedback: '', revisit: true })),
  };
  return state.virtualIntent === undefined ? next : { ...next, virtualIntent: withRevision(state.virtualIntent, request) };
}

export function applyIntentDocument(state: IntentState, markdown: string): IntentState {
  const parsed = parseIntentMarkdown(markdown, state);
  return { ...state, ...parsed, virtualIntent: markdown, intentSynced: Boolean(parsed) };
}

export function finishWork(state: IntentState): IntentState {
  return { ...state, finished: true, finishedAt: new Date().toLocaleString('ko-KR') };
}
