import { test, expect, type Page } from '@playwright/test';

interface CardRow {
  id: string;
  deckId: string;
  front: string;
  back: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueAt: string;
  createdAt: string;
}

const makeCard = (deckId: string, id: string, front: string, back: string): CardRow => ({
  id,
  deckId,
  front,
  back,
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  dueAt: new Date(0).toISOString(),
  createdAt: new Date(0).toISOString(),
});

async function stubCardsApi(page: Page): Promise<void> {
  const cards: CardRow[] = [];
  let nextId = 1;

  await page.route('**/api/decks/*/cards', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({ json: cards });
      return;
    }
    const body = request.postDataJSON() as { front: string; back: string };
    const created = makeCard('d1', `c${nextId++}`, body.front, body.back);
    cards.push(created);
    await route.fulfill({ status: 201, json: created });
  });

  await page.route('**/api/cards/*', async (route) => {
    const request = route.request();
    const id = request.url().split('/').pop() ?? '';
    const index = cards.findIndex((card) => card.id === id);
    if (request.method() === 'PATCH') {
      const body = request.postDataJSON() as { front: string; back: string };
      const existing = cards[index];
      if (existing) {
        existing.front = body.front;
        existing.back = body.back;
        await route.fulfill({ json: existing });
        return;
      }
    }
    if (request.method() === 'DELETE' && index >= 0) {
      cards.splice(index, 1);
    }
    await route.fulfill({ status: 204, body: '' });
  });
}

test('adds, edits, and deletes a card', async ({ page }) => {
  await stubCardsApi(page);
  await page.goto('/decks/d1');

  await expect(page.getByText(/no cards yet/i)).toBeVisible();

  await page.getByPlaceholder('Front (question)').fill('hola');
  await page.getByPlaceholder('Back (answer)').fill('hello');
  await page.getByRole('button', { name: /add card/i }).click();
  await expect(page.getByText('hola')).toBeVisible();

  await page.getByRole('button', { name: /edit hola/i }).click();
  await page.getByPlaceholder('Front (question)').fill('HOLA');
  await page.getByRole('button', { name: /save card/i }).click();
  await expect(page.getByText('HOLA')).toBeVisible();

  await page.getByRole('button', { name: /delete hola/i }).click();
  await expect(page.getByText(/no cards yet/i)).toBeVisible();
});
