export function detectRunInfo(pkg) {
  const script = pkg.scripts?.dev ? 'dev' : pkg.scripts?.start ? 'start' : '';
  const command = script ? `npm run ${script}` : '';
  const hasNext = pkg.dependencies?.next || pkg.devDependencies?.next;
  const port = pkg.scripts?.[script]?.match(/(?:--port|-p)\s*(\d+)/)?.[1] || (hasNext ? '3000' : '');
  return { command, port };
}

export function mergeRunInfo(state, { command, port }) {
  return { ...state, command: state.command || command, port: state.port || port, detected: Boolean(command && port) };
}
