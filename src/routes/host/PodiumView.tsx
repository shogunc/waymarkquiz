import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Participant } from '../../types'
import type { Strings } from '../../lib/strings'

const PLACE_HEIGHTS = ['h-56', 'h-40', 'h-28'] // 1st, 2nd, 3rd
const PODIUM_COLORS = ['bg-yellow-500', 'bg-slate-400', 'bg-amber-700'] // gold, silver, bronze
const REVEAL_ORDER = [2, 1, 0] // 3rd → 2nd → 1st
const REVEAL_INTERVAL_MS = 1600

export function PodiumView({ participants, onEnd, strings }: { participants: Participant[]; onEnd: () => void; strings: Strings }) {
  const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore)
  const top3 = sorted.slice(0, 3)
  const runnersUp = sorted.slice(3, 5)
  const [revealed, setRevealed] = useState(0)
  const s = strings.podium

  useEffect(() => {
    if (revealed >= top3.length) return
    const id = setTimeout(() => setRevealed((n) => n + 1), REVEAL_INTERVAL_MS)
    return () => clearTimeout(id)
  }, [revealed, top3.length])

  const visiblePlaces = REVEAL_ORDER.filter((place) => place < top3.length).slice(0, revealed)
  const allRevealed = revealed >= top3.length

  useEffect(() => {
    if (!allRevealed) return
    const end = Date.now() + 4000
    let frame: number
    function shoot() {
      confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, colors: ['#facc15', '#a3a3a3', '#b45309'] })
      confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, colors: ['#facc15', '#a3a3a3', '#b45309'] })
      if (Date.now() < end) frame = requestAnimationFrame(shoot)
    }
    shoot()
    return () => cancelAnimationFrame(frame)
  }, [allRevealed])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-12">
      <h1 className="text-3xl font-bold">{s.title}</h1>

      <div className="flex items-end justify-center gap-4">
        <AnimatePresence>
          {visiblePlaces.map((place) => {
            const p = top3[place]
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-2"
              >
                {place === 0 && <span className="text-3xl">👑</span>}
                <p className="text-lg font-semibold">{p.nickname}</p>
                <p className="tabular-nums text-slate-400">{p.totalScore} {s.pts}</p>

                {/* Bar grows upward from the ground */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ originY: 1 }}
                  transition={{ type: 'spring', stiffness: 110, damping: 18, delay: 0.15 }}
                  className={`flex w-28 items-start justify-center rounded-t-xl pt-3 ${PODIUM_COLORS[place]} ${PLACE_HEIGHTS[place]}`}
                >
                  <span className="text-2xl font-bold">{s.placeLabel(place)}</span>
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {allRevealed && runnersUp.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm"
        >
          <p className="mb-3 text-center text-sm font-medium text-slate-500">{s.honorableMentions}</p>
          <ul className="flex flex-col gap-2">
            {runnersUp.map((p, i) => (
              <li key={p.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                <span className="w-8 text-center text-sm font-bold text-slate-500">{s.placeLabel(3 + i)}</span>
                <span className="flex-1 text-left font-medium">{p.nickname}</span>
                <span className="tabular-nums text-slate-400">{p.totalScore} {s.pts}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {allRevealed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onEnd}
          className="rounded-xl border border-slate-700 px-6 py-3 font-medium hover:bg-slate-800"
        >
          {s.endSession}
        </motion.button>
      )}
    </div>
  )
}
