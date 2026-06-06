import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { Deck } from '@product-engineer/shared-contracts';
import { api, ApiError } from '../lib/api.js';
import { DeckList } from '../components/DeckList.js';

export function DecksScreen({ onSelectDeck }: { onSelectDeck: (deck: Deck) => void }) {
  const [decks, setDecks] = useState<Deck[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setDecks(await api.listDecks());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load decks.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.heading}>Decks</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : decks ? (
        <DeckList decks={decks} onSelect={onSelectDeck} />
      ) : (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12, backgroundColor: '#f3f4f6' },
  heading: { fontSize: 28, fontWeight: '700', color: '#111827' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 15, color: '#dc2626', padding: 12 },
});
