import { showScreen } from '@intent-loop/features/intent-loop/criteria';
import PreviewFrame from './PreviewFrame';
import RunStatus, { RunLog } from './RunStatus';

export default function PreviewPane({ s, phase, update, act }) {
  if (phase !== 'review') return <RunStatus s={s} phase={phase} update={update} />;
  return (
    <div className="preview-pane">
      <PreviewFrame s={s} onScreen={screen => act(showScreen, screen)} />
      <RunLog s={s} phase={phase} />
    </div>
  );
}
