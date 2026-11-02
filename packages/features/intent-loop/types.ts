export type Step = 1 | 2 | 3 | 4;
export type CriterionStatus = 'unchecked' | 'pass' | 'fix' | 'unverifiable';
export type ScreenName = 'home' | 'signup' | 'dashboard';
export type RunState = 'idle' | 'running' | 'done' | 'stopped' | 'failed';
export type PreviewState = 'idle' | 'running' | 'ready' | 'failed';
export type WorkPhase = 'building' | 'preparing' | 'review' | 'run-error' | 'preview-error';

export interface Criterion {
  id: number;
  text: string;
  location: string;
  visible: boolean;
  status: CriterionStatus;
  reason: string;
  feedback: string;
  revisit: boolean;
}

export interface RevisionItem {
  id: number;
  feedback: string;
}

export interface RevisionRequest {
  round: number;
  sentAt: string;
  message: string;
  url: string;
  screen: ScreenName;
  items: RevisionItem[];
}

export interface IntentState {
  step: Step;
  project: string;
  command: string;
  port: string;
  detected: boolean;
  problem: string;
  outcome: string;
  include: string;
  exclude: string;
  protect: string;
  unknown: string;
  criteria: Criterion[];
  nextId: number;
  run: RunState;
  preview: PreviewState;
  round: number;
  selected: number;
  previewPath: string;
  previewScreen: ScreenName;
  requests: RevisionRequest[];
  intentSynced: boolean;
  finished: boolean;
  finishConfirmed: boolean;
  finishedAt: string;
  virtualIntent?: string;
}

export type Transition<A extends unknown[] = []> = (state: IntentState, ...args: A) => IntentState;
export type Act = <A extends unknown[]>(transition: Transition<A>, ...args: A) => void;
export type Update = (patch: Partial<IntentState>) => void;

export interface RunInfo {
  command: string;
  port: string;
}

export interface PackageJson {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
