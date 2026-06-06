import { test, expect, type Page } from '@playwright/test';

const dueCard = (id: string, front: string) => ({
  id,
  deckId: 'd1',
  front,
  back: `${front} (answer)`,
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  dueAt: new Date(0).toISOString(),
  createdAt: new Date(0).toISOString(),
});

async function stubReviewApi(page: Page, cards: ReturnType<typeof dueCard>[]): Promise<void> {
  await page.route('**/api/decks/*/review', async (route) => {
    await route.fulfill({ json: { deckId: 'd1', cards } });
  });
  await page.route('**/api/cards/*/review', async (route) => {
    await route.fulfill({ json: dueCard('graded', 'graded') });
  });
}

test('reveals, grades, and completes a due session', async ({ page }) => {
  await stubReviewApi(page, [dueCard('c1', 'hola'), dueCard('c2', 'gato')]);
  await page.goto('/decks/d1/review');

  await expect(page.getByText('hola')).toBeVisible();
  await page.getByRole('button', { name: /show answer/i }).click();
  await expect(page.getByText('hola (answer)')).toBeVisible();
  await page.getByRole('button', { name: /grade 5/i }).click();

  await expect(page.getByText('gato')).toBeVisible();
  await page.getByRole('button', { name: /show answer/i }).click();
  await page.getByRole('button', { name: /grade 3/i }).click();

  await expect(page.getByText(/review complete/i)).toBeVisible();
});

test('shows an empty state when nothing is due', async ({ page }) => {
  await stubReviewApi(page, []);
  await page.goto('/decks/d1/review');

  await expect(page.getByText(/no cards are due/i)).toBeVisible();
});
