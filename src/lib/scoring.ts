/**
 * Points awarded for guessing `guessedYear` when the correct answer is
 * `correctYear`: 10 minus the distance in years, floored at 0.
 *
 * Single source of truth — used for both the authoritative scoring (written
 * by the host) and any live client-side previews.
 */
export function scoreGuess(correctYear: number, guessedYear: number): number {
  return Math.max(0, 10 - Math.abs(correctYear - guessedYear))
}
