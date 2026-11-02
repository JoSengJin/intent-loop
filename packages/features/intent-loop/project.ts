import type { IntentState, PackageJson, RunInfo } from './types';

export function detectRunInfo(pkg: PackageJson): RunInfo {
  const script = pkg.scripts?.dev ? 'dev' : pkg.scripts?.start ? 'start' : '';
  const command = script ? `npm run ${script}` : '';
  const hasNext = pkg.dependencies?.next || pkg.devDependencies?.next;
  const port = pkg.scripts?.[script]?.match(/(?:--port|-p)\s*(\d+)/)?.[1] || (hasNext ? '3000' : '');
  return { command, port };
}

export function mergeRunInfo(state: IntentState, { command, port }: RunInfo): IntentState {
  return { ...state, command: state.command || command, port: state.port || port, detected: Boolean(command && port) };
}
