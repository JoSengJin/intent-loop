export const modes = [
  { id: 'system', label: '시스템' },
  { id: 'light', label: '라이트' },
  { id: 'dark', label: '다크' },
] as const;

export type ModeId = (typeof modes)[number]['id'];

export const modeStorageKey = 'intent-loop-mode';

export const darkQuery = '(prefers-color-scheme: dark)';

export function isModeId(value: string | null): value is ModeId {
  return modes.some(mode => mode.id === value);
}

export function resolveMode(mode: ModeId, systemPrefersDark: boolean): 'light' | 'dark' {
  if (mode === 'system') return systemPrefersDark ? 'dark' : 'light';
  return mode;
}
