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

  function scoreFor(p: Participant): number {
    if (revealed) return p.totalScore
    const pointsThisRound = answers.find((a) => a.participantId === p.id)?.pointsEarned ?? 0
    return p.totalScore - pointsThisRound
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
          {ranked.map((p, index) => (
            <motion.li
              key={p.id}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex h-16 items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 px-4"
            >
              <span className="w-8 text-center text-lg font-bold text-slate-500">{index + 1}</span>
              <span className="flex-1 text-left font-medium">{p.nickname}</span>
              <span className="text-xl font-bold tabular-nums">{scoreFor(p)}</span>
            </motion.li>
          ))}
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
