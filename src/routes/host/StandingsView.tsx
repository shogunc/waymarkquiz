import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Answer, Participant } from '../../types'
import type { Strings } from '../../lib/strings'

const REVEAL_DELAY_MS = 2000

export function StandingsView({
  participants,
  answers,
  isLastQuestion,
  onNext,
  advancing,
  strings,
}: {
  participants: Participant[]
  /** This question's scored answers — used to roll scores back to where they stood before this round. */
  answers: Answer[]
  isLastQuestion: boolean
  onNext: () => void
  advancing: boolean
  strings: Strings
}) {
  const s = strings.standings

  // Enter showing the standings as they were before this round's points were added (or
  // everyone on zero, for the first question — totalScore minus this round's points lands
  // on the same value either way), then reveal the new totals after a beat so the rank
  // changes are visible rather than arriving pre-shuffled.
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), REVEAL_DELAY_MS)
    return () => clearTimeout(id)
  }, [])

  const pointsMap = new Map(answers.map((a) => [a.participantId, a.pointsEarned ?? 0]))
  const getPoints = (p: Participant) => pointsMap.get(p.id) ?? 0

  // Precompute rank indices for both before/after so we can show movement arrows.
  const previousRankOf = new Map(
    [...participants].sort((a, b) => (b.totalScore - getPoints(b)) - (a.totalScore - getPoints(a))).map((p, i) => [p.id, i])
  )
  const finalRankOf = new Map(
    [...participants].sort((a, b) => b.totalScore - a.totalScore).map((p, i) => [p.id, i])
  )

  function scoreFor(p: Participant): number {
    return revealed ? p.totalScore : p.totalScore - getPoints(p)
  }

  const ranked = [...participants].sort((a, b) => scoreFor(b) - scoreFor(a))

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8">
      <h1 className="text-2xl font-semibold">{s.title}</h1>

      {/* Fixed to exactly 5 rows tall (h-16 rows + gap-2 between them: 5*64 + 4*8 = 352px)
          and clipped — every participant is still rendered and laid out, so as scores
          shift, anyone crossing the cutoff visibly slides in or out from the bottom edge. */}
      <div className="h-[352px] w-full overflow-hidden">
        <ul className="flex w-full flex-col gap-2">
          {ranked.map((p, index) => {
            const points = getPoints(p)
            const rankDelta = (previousRankOf.get(p.id) ?? index) - (finalRankOf.get(p.id) ?? index)
            return (
              <motion.li
                key={p.id}
                layout
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                className="flex h-16 items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 px-4"
              >
                <span className="w-8 text-center text-lg font-bold text-slate-500">{index + 1}</span>
                <span className="flex-1 text-left font-medium">{p.nickname}</span>
                {revealed && (
                  <span className="flex items-center gap-1 text-sm tabular-nums">
                    {rankDelta > 0 && <span className="font-bold text-emerald-400">▲</span>}
                    {rankDelta < 0 && <span className="font-bold text-red-400">▼</span>}
                    {points > 0 && <span className="text-slate-400">+{points}</span>}
                  </span>
                )}
                <span className="text-xl font-bold tabular-nums">{scoreFor(p)}</span>
              </motion.li>
            )
          })}
        </ul>
      </div>

      <button
        onClick={onNext}
        disabled={advancing}
        className="rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold hover:bg-indigo-500 disabled:opacity-40"
      >
        {advancing ? s.loading : isLastQuestion ? s.showFinalResults : s.nextQuestion}
      </button>
    </div>
  )
}
