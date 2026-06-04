// TODO: Replace with a real component library as projects require it.
import type { ReactNode } from 'react';

export const PACKAGE_NAME = '@product-engineer/ui';

export function Button({ children }: { children: ReactNode }) {
  return <button type="button">{children}</button>;
}

export function Card({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function Text({ children }: { children: ReactNode }) {
  return <span>{children}</span>;
}
