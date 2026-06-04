// Test-only stub. Real react-native cannot be imported under Node/vitest
// (Flow syntax, native modules). The smoke test never renders, so these
// no-op components only need to exist as importable bindings.
import type { ReactNode } from 'react';

export function View({ children }: { children?: ReactNode }) {
  return children ?? null;
}

export function Text({ children }: { children?: ReactNode }) {
  return children ?? null;
}
