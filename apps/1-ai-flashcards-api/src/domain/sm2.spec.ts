import { applySm2, type Sm2State } from './sm2';

const NOW = new Date('2026-06-04T00:00:00.000Z');
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const dueAfter = (days: number) => new Date(NOW.getTime() + days * MS_PER_DAY);

const state = (overrides: Partial<Sm2State> = {}): Sm2State => ({
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  dueAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('applySm2', () => {
  it('schedules the first successful review one day out and increments repetitions', () => {
    const next = applySm2(state(), 5, NOW);
    expect(next.repetitions).toBe(1);
    expect(next.interval).toBe(1);
    expect(next.easeFactor).toBeCloseTo(2.6, 10);
    expect(next.dueAt).toEqual(dueAfter(1));
  });

  it('schedules the second successful review six days out', () => {
    const next = applySm2(state({ easeFactor: 2.6, interval: 1, repetitions: 1 }), 5, NOW);
    expect(next.repetitions).toBe(2);
    expect(next.interval).toBe(6);
    expect(next.easeFactor).toBeCloseTo(2.7, 10);
    expect(next.dueAt).toEqual(dueAfter(6));
  });

  it('scales later intervals by the ease factor and rounds to whole days', () => {
    const next = applySm2(state({ easeFactor: 2.7, interval: 6, repetitions: 2 }), 4, NOW);
    expect(next.repetitions).toBe(3);
    expect(next.interval).toBe(16); // round(6 * 2.7) = round(16.2)
    expect(next.easeFactor).toBeCloseTo(2.7, 10); // grade 4 leaves ease unchanged
    expect(next.dueAt).toEqual(dueAfter(16));
  });

  it('resets repetitions and relearns at one day when grade < 3, still updating ease', () => {
    const next = applySm2(state({ easeFactor: 2.7, interval: 16, repetitions: 3 }), 2, NOW);
    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
    expect(next.easeFactor).toBeCloseTo(2.38, 10); // 2.7 + (0.1 - 3*(0.08+3*0.02))
    expect(next.dueAt).toEqual(dueAfter(1));
  });

  it('never lets the ease factor drop below the 1.3 floor', () => {
    const next = applySm2(state({ easeFactor: 1.3, interval: 10, repetitions: 5 }), 0, NOW);
    expect(next.easeFactor).toBe(1.3);

    const fromJustAbove = applySm2(
      state({ easeFactor: 1.35, interval: 10, repetitions: 5 }),
      0,
      NOW,
    );
    expect(fromJustAbove.easeFactor).toBe(1.3);
  });

  it('raises the ease factor on a perfect grade and lowers it on a hard pass', () => {
    expect(applySm2(state(), 5, NOW).easeFactor).toBeCloseTo(2.6, 10);
    expect(applySm2(state(), 3, NOW).easeFactor).toBeCloseTo(2.36, 10); // 2.5 + (0.1 - 2*0.12)
  });
});
