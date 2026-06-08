import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Participant } from '../../types'

const PLACE_LABELS = ['1st', '2nd', '3rd']
const PLACE_HEIGHTS = ['h-56', 'h-40', 'h-28']
const REVEAL_ORDER = [2, 1, 0] // 3rd, then 2nd, then 1st

export function PodiumView({ participants, onEnd }: { participants: Participant[]; onEnd: () => void }) {
  const top3 = [...participants].sort((a, b) => b.totalScore - a.totalScore).slice(0, 3)
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    if (revealed >= top3.length) return
    const id = setTimeout(() => setRevealed((n) => n + 1), 1200)
    return () => clearTimeout(id)
  }, [revealed, top3.length])

  const visiblePlaces = REVEAL_ORDER.filter((place) => place < top3.length).slice(0, revealed)
  const allRevealed = revealed >= top3.length

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-12">
      <h1 className="text-3xl font-bold">🏆 Final results</h1>

      <div className="flex items-end justify-center gap-4">
        <AnimatePresence>
          {visiblePlaces.map((place) => {
            const p = top3[place]
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="flex flex-col items-center gap-2"
              >
                <p className="text-lg font-semibold">{p.nickname}</p>
                <p className="text-slate-400">{p.totalScore} pts</p>
                <div className={`flex w-28 items-start justify-center rounded-t-xl bg-indigo-600 pt-3 ${PLACE_HEIGHTS[place]}`}>
                  <span className="text-2xl font-bold">{PLACE_LABELS[place]}</span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {allRevealed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onEnd}
          className="rounded-xl border border-slate-700 px-6 py-3 font-medium hover:bg-slate-800"
        >
          End session
        </motion.button>
      )}
    </div>
  )
}
