'use client';

interface Props {
  variant?: 'presented' | 'copyright';
}

export default function StudioCredit({ variant = 'copyright' }: Props) {
  const label = variant === 'presented' ? 'PRESENTED BY SIMJI' : '© SIMJI';
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-[11px] tracking-widest pointer-events-none z-10 whitespace-nowrap">
      {label}
    </div>
  );
}
