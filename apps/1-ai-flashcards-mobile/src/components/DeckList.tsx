import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Deck } from '@product-engineer/shared-contracts';

export function DeckList({ decks, onSelect }: { decks: Deck[]; onSelect: (deck: Deck) => void }) {
  return (
    <FlatList
      data={decks}
      keyExtractor={(deck) => deck.id}
      ListEmptyComponent={<Text style={styles.empty}>No decks yet.</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          accessibilityRole="button"
          accessibilityLabel={`Review ${item.name}`}
          onPress={() => onSelect(item)}
        >
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{item.cardCount} cards</Text>
            <Text style={styles.badge}>{item.dueCount} due</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: '#ffffff',
    gap: 6,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
  },
  title: { fontSize: 17, fontWeight: '600', color: '#111827' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { fontSize: 14, color: '#6b7280' },
  badge: { fontSize: 13, fontWeight: '600', color: '#2563eb' },
  empty: { fontSize: 15, color: '#6b7280', textAlign: 'center', padding: 24 },
});
