export const themes = [
  { id: 'lime', label: '라임', color: '#d5eb5d' },
  { id: 'ocean', label: '오션', color: '#a5d8f3' },
  { id: 'violet', label: '바이올렛', color: '#cfc3f7' },
  { id: 'coral', label: '코랄', color: '#f8c4a8' },
] as const;

export type ThemeId = (typeof themes)[number]['id'];

export const themeStorageKey = 'intent-loop-theme';

export function isThemeId(value: string | null): value is ThemeId {
  return themes.some(theme => theme.id === value);
}
