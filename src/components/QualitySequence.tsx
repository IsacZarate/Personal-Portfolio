import { useEffect, useState } from 'react';

const stages = [
  { label: 'Specify', detail: 'Define observable behavior and boundaries before implementation begins.' },
  { label: 'Build', detail: 'Keep the architecture small, typed, and explicit about missing information.' },
  { label: 'Exercise', detail: 'Cover content rules, browser journeys, accessibility, and infrastructure output.' },
  { label: 'Deliver', detail: 'Promote only a revision that has passed the same repeatable quality gates.' },
] as const;

export default function QualitySequence() {
  const [activeStage, setActiveStage] = useState(0);
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  if (!interactive) return <ol className="quality-static">{stages.map((stage) => <li key={stage.label}><h3>{stage.label}</h3><p>{stage.detail}</p></li>)}</ol>;

  return (
    <div className="quality-sequence" aria-label="Engineering quality sequence">
      <div className="quality-tabs" role="tablist" aria-label="Quality stages">
        {stages.map((stage, index) => (
          <button
            key={stage.label}
            type="button"
            role="tab"
            id={`quality-tab-${index}`}
            aria-controls={`quality-panel-${index}`}
            aria-selected={activeStage === index}
            tabIndex={activeStage === index ? 0 : -1}
            onClick={() => setActiveStage(index)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? stages.length - 1
                  : (activeStage + (event.key === 'ArrowRight' ? 1 : -1) + stages.length) % stages.length;
              setActiveStage(next);
              document.getElementById(`quality-tab-${next}`)?.focus();
            }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>{stage.label}
          </button>
        ))}
      </div>
      {stages.map((stage, index) => (
        <div key={stage.label} role="tabpanel" id={`quality-panel-${index}`} aria-labelledby={`quality-tab-${index}`} hidden={activeStage !== index}>
          <p>{stage.detail}</p>
        </div>
      ))}
    </div>
  );
}
