import { useMode } from '../hooks/use-mode';
import { modes } from '../lib/modes';

export default function ModePicker() {
  const { mode, choose } = useMode();
  return (
    <div className="mode-picker" role="group" aria-label="화면 밝기">
      {modes.map(item => (
        <button
          key={item.id}
          className={`mode-option ${mode === item.id ? 'active' : ''}`}
          aria-pressed={mode === item.id}
          onClick={() => choose(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
