import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import type { Deck } from '@product-engineer/shared-contracts';
import { DecksScreen } from './src/screens/DecksScreen.js';
import { ReviewScreen } from './src/screens/ReviewScreen.js';

// Two-screen flow (decks → review) driven by local state. A native router is
// deliberately deferred for this Project-1 app (ADR-004): two screens don't
// justify the expo-router dependency and its test stubs yet.
export default function App() {
  const [deck, setDeck] = useState<Deck | null>(null);

  return (
    <>
      {deck ? (
        <ReviewScreen deck={deck} onBack={() => setDeck(null)} />
      ) : (
        <DecksScreen onSelectDeck={setDeck} />
      )}
      <StatusBar style="auto" />
    </>
  );
}
