import { showScreen } from '@intent-loop/features/intent-loop/criteria';
import type { Act, IntentState, ScreenName, Update, WorkPhase } from '@intent-loop/features/intent-loop/types';
import PreviewFrame from './PreviewFrame';
import RunStatus, { RunLog } from './RunStatus';

interface PreviewPaneProps {
  s: IntentState;
  phase: WorkPhase;
  update: Update;
  act: Act;
}

export default function PreviewPane({ s, phase, update, act }: PreviewPaneProps) {
  if (phase !== 'review') return <RunStatus s={s} phase={phase} update={update} />;
  return (
    <div className="preview-pane">
      <PreviewFrame s={s} onScreen={(screen: ScreenName) => act(showScreen, screen)} />
      <RunLog s={s} phase={phase} />
    </div>
  );
}
