import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Card } from '@product-engineer/shared-contracts';

const GRADES = [0, 1, 2, 3, 4, 5];

export function ReviewSession({
  cards,
  onGrade,
}: {
  cards: Card[];
  onGrade: (cardId: string, grade: number) => Promise<void>;
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (cards.length === 0) {
    return <Text style={styles.done}>No cards are due right now. 🎉</Text>;
  }
  if (index >= cards.length) {
    return <Text style={styles.done}>Review complete — {cards.length} card(s) reviewed.</Text>;
  }

  const card = cards[index];
  if (!card) return null;

  const grade = async (value: number) => {
    setBusy(true);
    try {
      await onGrade(card.id, value);
      setIndex((prev) => prev + 1);
      setRevealed(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.stack}>
      <Text style={styles.meta}>
        Card {index + 1} of {cards.length}
      </Text>

      <View style={styles.card}>
        <Text style={styles.front}>{card.front}</Text>
      </View>

      {revealed ? (
        <View style={styles.stack}>
          <View style={styles.card}>
            <Text style={styles.back}>{card.back}</Text>
          </View>
          <View style={styles.grades}>
            {GRADES.map((value) => (
              <Pressable
                key={value}
                style={styles.gradeButton}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={`Grade ${value}`}
                onPress={() => grade(value)}
              >
                <Text style={styles.gradeLabel}>{value}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <Pressable
          style={styles.primary}
          accessibilityRole="button"
          accessibilityLabel="Show answer"
          onPress={() => setRevealed(true)}
        >
          <Text style={styles.primaryLabel}>Show answer</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  meta: { fontSize: 14, color: '#6b7280' },
  card: {
    padding: 24,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
  },
  front: { fontSize: 22, fontWeight: '600', color: '#111827' },
  back: { fontSize: 18, color: '#374151' },
  done: { fontSize: 16, color: '#374151', textAlign: 'center', padding: 24 },
  grades: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gradeButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e7ff',
  },
  gradeLabel: { fontSize: 18, fontWeight: '700', color: '#3730a3' },
  primary: {
    paddingVertical: 14,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  primaryLabel: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
});
