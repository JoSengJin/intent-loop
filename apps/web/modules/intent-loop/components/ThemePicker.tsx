import { useTheme } from '../hooks/use-theme';
import { themes } from '../lib/themes';

export default function ThemePicker() {
  const { theme, choose } = useTheme();
  return (
    <div className="theme-picker" role="group" aria-label="화면 테마">
      {themes.map(item => (
        <button
          key={item.id}
          className={`theme-swatch ${theme === item.id ? 'active' : ''}`}
          style={{ background: item.color }}
          aria-label={`${item.label} 테마`}
          aria-pressed={theme === item.id}
          title={item.label}
          onClick={() => choose(item.id)}
        />
      ))}
    </div>
  );
}
