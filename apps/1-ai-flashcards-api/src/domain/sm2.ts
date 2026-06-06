/**
 * SM-2 spaced-repetition scheduler (api-local domain logic, ADR-020).
 *
 * Pure state transition over a card's scheduling state. Callers validate the
 * grade (integer 0-5) before calling — see the Zod GradeRequest contract.
 */
export interface Sm2State {
  /** Ease factor, floored at 1.3. */
  easeFactor: number;
  /** Current inter-review interval in days. */
  interval: number;
  /** Count of consecutive successful (grade >= 3) reviews. */
  repetitions: number;
  /** When the card next becomes due. */
  dueAt: Date;
}

const MIN_EASE_FACTOR = 1.3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Apply a single review of `grade` to `state` at time `now`, returning the next
 * scheduling state (per the algorithm in the feature spec §7).
 */
export function applySm2(state: Sm2State, grade: number, now: Date): Sm2State {
  let { easeFactor, interval, repetitions } = state;

  if (grade < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
  );

  return {
    easeFactor,
    interval,
    repetitions,
    dueAt: new Date(now.getTime() + interval * MS_PER_DAY),
  };
}
