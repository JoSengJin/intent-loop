import type { Dispatch, SetStateAction } from 'react';
import type { Act, IntentState, Update } from '@intent-loop/features/intent-loop/types';

export interface ViewProps {
  s: IntentState;
  update: Update;
  act: Act;
  setS: Dispatch<SetStateAction<IntentState>>;
}
