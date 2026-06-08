import { motion } from 'framer-motion'
import type { Participant } from '../../types'

export function StandingsView({
  participants,
  isLastQuestion,
  onNext,
  advancing,
}: {
  participants: Participant[]
  isLastQuestion: boolean
  onNext: () => void
  advancing: boolean
}) {
  const ranked = [...participants].sort((a, b) => b.totalScore - a.totalScore)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8">
      <h1 className="text-2xl font-semibold">Standings</h1>

      <ul className="flex w-full flex-col gap-2">
        {ranked.map((p, index) => (
          <motion.li
            key={p.id}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <span className="w-8 text-center text-lg font-bold text-slate-500">{index + 1}</span>
            <span className="flex-1 text-left font-medium">{p.nickname}</span>
            <span className="text-xl font-bold tabular-nums">{p.totalScore}</span>
          </motion.li>
        ))}
      </ul>

      <button
        onClick={onNext}
        disabled={advancing}
        className="rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold hover:bg-indigo-500 disabled:opacity-40"
      >
        {advancing ? 'Loading…' : isLastQuestion ? 'Show final results' : 'Next question'}
      </button>
    </div>
  )
}
