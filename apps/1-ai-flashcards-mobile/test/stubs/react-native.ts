// Test-only stub. Real react-native cannot be imported under Node/vitest
// (Flow syntax, native modules), so these no-op components stand in for the
// core primitives the screens use. They render their children (or invoke
// renderItem) so react-test-renderer can build a tree the tests can query.
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

export function View({ children }: { children?: ReactNode }) {
  return children ?? null;
}

export function Text({ children }: { children?: ReactNode }) {
  return children ?? null;
}

export function SafeAreaView({ children }: { children?: ReactNode }) {
  return children ?? null;
}

export function ScrollView({ children }: { children?: ReactNode }) {
  return children ?? null;
}

export function Pressable({ children }: { children?: ReactNode; onPress?: () => void }) {
  return children ?? null;
}

export function ActivityIndicator() {
  return null;
}

type FlatListProps<T> = {
  data: readonly T[] | null | undefined;
  renderItem: (info: { item: T; index: number }) => ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  ListEmptyComponent?: ReactNode;
};

export function FlatList<T>({
  data,
  renderItem,
  keyExtractor,
  ListEmptyComponent,
}: FlatListProps<T>) {
  if (!data || data.length === 0) {
    return ListEmptyComponent ?? null;
  }
  return data.map((item, index) => {
    const element = renderItem({ item, index });
    const key = keyExtractor ? keyExtractor(item, index) : String(index);
    return isValidElement(element) ? cloneElement(element, { key }) : element;
  });
}

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
};
