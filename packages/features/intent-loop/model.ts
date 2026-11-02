import type { Criterion, CriterionStatus, IntentState, WorkPhase } from './types';

export const steps = ['프로젝트 설정', 'Intent 작성', '개발·검토 루프', '종료'];
export const statusNames: Record<CriterionStatus, string> = { unchecked: '미확인', pass: '통과', fix: '수정 필요', unverifiable: '확인 불가' };

export function newCriterion(id: number): Criterion {
  return { id, text: '', location: '', visible: true, status: 'unchecked', reason: '', feedback: '', revisit: false };
}

export const initialState: IntentState = {
  step: 1, project: '', command: '', port: '', detected: false, problem: '', outcome: '', include: '', exclude: '', protect: '', unknown: '',
  criteria: [newCriterion(1)],
  nextId: 2, run: 'idle', preview: 'idle', round: 0, selected: 1, previewPath: '/', previewScreen: 'home', requests: [], intentSynced: true,
  finished: false, finishConfirmed: false, finishedAt: '',
};

export function counts(criteria: Criterion[]): Record<CriterionStatus, number> {
  const count = (status: CriterionStatus) => criteria.filter(c => c.status === status).length;
  return { unchecked: count('unchecked'), pass: count('pass'), fix: count('fix'), unverifiable: count('unverifiable') };
}

export function detectPackage(files: FileList | File[]): File | undefined {
  return [...files].find(file => file.webkitRelativePath?.split('/').length === 2 && file.name === 'package.json');
}

export function workPhase(state: IntentState): WorkPhase {
  if (state.run === 'running') return 'building';
  if (state.run !== 'done') return 'run-error';
  if (state.preview === 'failed') return 'preview-error';
  return state.preview === 'ready' ? 'review' : 'preparing';
}
