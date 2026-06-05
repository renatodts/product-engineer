import { test, expect, type Page } from '@playwright/test';

interface DeckRow {
  id: string;
  name: string;
  createdAt: string;
  cardCount: number;
  dueCount: number;
}

/** Stub the decks api in the browser so the flow runs without a backend. */
async function stubDecksApi(page: Page, initial: DeckRow[] = []): Promise<void> {
  const decks = [...initial];
  let nextId = initial.length + 1;

  await page.route('**/api/decks', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({ json: decks });
      return;
    }
    const body = request.postDataJSON() as { name: string };
    const created: DeckRow = {
      id: `d${nextId++}`,
      name: body.name,
      createdAt: new Date(0).toISOString(),
      cardCount: 0,
      dueCount: 0,
    };
    decks.push(created);
    await route.fulfill({ status: 201, json: created });
  });

  await page.route('**/api/decks/*', async (route) => {
    const id = route.request().url().split('/').pop() ?? '';
    const index = decks.findIndex((deck) => deck.id === id);
    if (index >= 0) decks.splice(index, 1);
    await route.fulfill({ status: 204, body: '' });
  });
}

test('creates and deletes a deck without a full reload', async ({ page }) => {
  await stubDecksApi(page);
  await page.goto('/');

  await expect(page.getByText(/no decks yet/i)).toBeVisible();

  await page.getByLabel('Deck name').fill('Spanish');
  await page.getByRole('button', { name: /create deck/i }).click();

  await expect(page.getByText('Spanish')).toBeVisible();

  await page.getByRole('button', { name: /delete spanish/i }).click();
  await expect(page.getByText(/no decks yet/i)).toBeVisible();
});

test('lists existing decks with their due counts', async ({ page }) => {
  await stubDecksApi(page, [
    { id: 'd1', name: 'Biology', createdAt: new Date(0).toISOString(), cardCount: 5, dueCount: 2 },
  ]);
  await page.goto('/');

  await expect(page.getByText('Biology')).toBeVisible();
  await expect(page.getByText(/2 due/i)).toBeVisible();
});
