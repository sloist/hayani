const NAMES = ['COUNTER', 'CHECKOUT', 'COMPLETE'];

interface Props {
  current: number; // 1, 2, or 3
}

export default function StepIndicator({ current }: Props) {
  return (
    <span style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--text2)', fontWeight: 400 }}>
      {NAMES[current - 1] || ''}
    </span>
  );
}
