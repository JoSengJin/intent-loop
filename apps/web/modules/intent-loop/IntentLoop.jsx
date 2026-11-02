'use client';

import FinishStep from './components/FinishStep';
import IntentStep from './components/IntentStep';
import ProjectStep from './components/ProjectStep';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Workbench from './components/Workbench';
import { useIntentState } from './hooks/use-intent-state';
import { useRunSimulation } from './hooks/use-run-simulation';

const views = { 1: ProjectStep, 2: IntentStep, 3: Workbench, 4: FinishStep };

export default function IntentLoop() {
  const { s, setS, hydrated, saveError, update, act } = useIntentState();
  useRunSimulation(s, update, hydrated);
  if (!hydrated) return null;
  const View = views[s.step] || ProjectStep;
  return (
    <div className="app-shell">
      <Sidebar s={s} />
      <main className="main">
        <TopBar s={s} saveError={saveError} />
        <div className={`content ${s.step === 3 ? 'content-wide' : ''}`}>
          <View s={s} update={update} act={act} setS={setS} />
        </div>
      </main>
    </div>
  );
}
