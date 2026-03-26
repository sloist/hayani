const STEPS = ['Box', 'Checkout', 'Complete'];

interface Props {
  current: number; // 1, 2, or 3
}

export default function StepIndicator({ current }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', letterSpacing: '2px' }}>
      {STEPS.map((step, i) => (
        <span key={step}>
          {i > 0 && <span style={{ color: 'var(--text3)', margin: '0 2px' }}>·</span>}
          <span style={{
            color: current === i + 1 ? 'var(--text)' : 'var(--text3)',
            fontWeight: current === i + 1 ? 500 : 300,
          }}>
            {step}
          </span>
        </span>
      ))}
    </div>
  );
}
