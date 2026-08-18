type Step = { id: string; label: string; description?: string };

type StepperProps = {
  steps: Step[];
  current: number;
};

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="space-y-4">
      <ol className="grid gap-2">
        {steps.map((step, index) => {
          const isComplete = index < current;
          const isCurrent = index === current;
          return (
            <li key={step.id} className="flex items-start gap-3">
              <span
                className={[
                  'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  isComplete ? 'bg-primary text-surface' : isCurrent ? 'bg-primary/10 text-primary' : 'bg-surface-muted text-ink-muted',
                ].join(' ')}
              >
                {isComplete ? '✓' : index + 1}
              </span>
              <div>
                <p className={['text-sm font-semibold', isCurrent ? 'text-ink' : 'text-ink-muted'].join(' ')}>
                  {step.label}
                </p>
                {step.description ? <p className="text-xs text-ink-muted">{step.description}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}