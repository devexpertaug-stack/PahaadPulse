import type { ReactNode } from 'react';
import { toneClass } from './tones';
import type { Tone } from './tones';

export default function Badge({
  tone = 'slate',
  children,
  className = '',
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={`chip ${toneClass[tone]} ${className}`}>{children}</span>;
}
