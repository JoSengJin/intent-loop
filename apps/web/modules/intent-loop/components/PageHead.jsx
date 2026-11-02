import { steps } from '@intent-loop/features/intent-loop/model';

export default function PageHead({ step, title, text }) {
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">STEP {String(step).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      <div className="step-count"><b>{step}</b> / {steps.length}</div>
    </div>
  );
}
