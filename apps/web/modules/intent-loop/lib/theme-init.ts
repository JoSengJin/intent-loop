import { darkQuery, modeStorageKey } from './modes';
import { themeStorageKey } from './themes';

// 첫 페인트 전에 저장된 팔레트·밝기를 <html>에 적용해 기본값이 잠깐 보이는 것을 막는다.
// 아래 밝기 판단은 lib/modes.ts의 resolveMode와 같은 규칙이다.
export const themeInitScript = `(function () {
  try {
    var root = document.documentElement;
    var theme = localStorage.getItem(${JSON.stringify(themeStorageKey)});
    if (theme) root.dataset.theme = theme;
    var mode = localStorage.getItem(${JSON.stringify(modeStorageKey)});
    if (mode !== 'light' && mode !== 'dark') mode = 'system';
    if (mode === 'system') mode = matchMedia(${JSON.stringify(darkQuery)}).matches ? 'dark' : 'light';
    root.dataset.mode = mode;
  } catch (e) { /* 저장 공간을 못 읽으면 CSS 기본값(라이트)을 쓴다 */ }
})();`;
