import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { Card, Deck } from '@product-engineer/shared-contracts';
import { api, ApiError } from '../lib/api.js';
import { ReviewSession } from '../components/ReviewSession.js';

export function ReviewScreen({ deck, onBack }: { deck: Deck; onBack: () => void }) {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const session = await api.reviewSession(deck.id);
      setCards(session.cards);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load the review session.');
    }
  }, [deck.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const grade = useCallback(async (cardId: string, value: number) => {
    await api.gradeCard(cardId, value);
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to decks" onPress={onBack}>
          <Text style={styles.back}>‹ Decks</Text>
        </Pressable>
        <Text style={styles.heading}>{deck.name}</Text>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : cards ? (
        <ReviewSession cards={cards} onGrade={grade} />
      ) : (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 16, backgroundColor: '#f3f4f6' },
  header: { gap: 4 },
  back: { fontSize: 16, color: '#2563eb' },
  heading: { fontSize: 24, fontWeight: '700', color: '#111827' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 15, color: '#dc2626', padding: 12 },
});
