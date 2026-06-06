import { test, expect, type Page } from '@playwright/test';

async function stubApi(page: Page, opts: { failGenerate?: boolean } = {}): Promise<void> {
  await page.route('**/api/decks/*/cards', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: [] });
      return;
    }
    await route.fulfill({ status: 201, json: {} });
  });

  await page.route('**/api/decks/*/generate', async (route) => {
    if (opts.failGenerate) {
      await route.fulfill({ status: 502, json: { message: 'AI generation failed' } });
      return;
    }
    await route.fulfill({
      json: [
        { front: 'Capital of France?', back: 'Paris' },
        { front: 'Capital of Spain?', back: 'Madrid' },
      ],
    });
  });

  await page.route('**/api/decks/*/cards/accept', async (route) => {
    const body = route.request().postDataJSON() as {
      suggestions: { front: string; back: string }[];
    };
    const created = body.suggestions.map((s, i) => ({
      id: `c${i}`,
      deckId: 'd1',
      front: s.front,
      back: s.back,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      dueAt: new Date(0).toISOString(),
      createdAt: new Date(0).toISOString(),
    }));
    await route.fulfill({ status: 201, json: created });
  });
}

test('previews suggestions and saves only the accepted ones', async ({ page }) => {
  await stubApi(page);
  await page.goto('/decks/d1');

  await page.getByLabel('Notes').fill('France and Spain capitals');
  await page.getByRole('button', { name: /^generate/i }).click();

  await expect(page.getByText('Capital of France?')).toBeVisible();
  // deselect the second suggestion, accept the first
  await page.getByRole('checkbox', { name: 'Capital of Spain?' }).uncheck();
  await page.getByRole('button', { name: /accept/i }).click();

  // accepted card appears in the deck's card list
  await expect(page.getByRole('button', { name: /delete capital of france\?/i })).toBeVisible();
});

test('shows a retry action when generation fails and keeps the notes', async ({ page }) => {
  await stubApi(page, { failGenerate: true });
  await page.goto('/decks/d1');

  await page.getByLabel('Notes').fill('these notes survive');
  await page.getByRole('button', { name: /^generate/i }).click();

  await expect(page.getByText(/generation failed/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  await expect(page.getByLabel('Notes')).toHaveValue('these notes survive');
});
