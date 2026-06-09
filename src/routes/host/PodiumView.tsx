import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Participant } from '../../types'
import type { Strings } from '../../lib/strings'

const PLACE_HEIGHTS = ['h-56', 'h-40', 'h-28'] // rank 0 (1st), 1 (2nd), 2 (3rd)
const PODIUM_COLORS = ['bg-yellow-500', 'bg-slate-400', 'bg-amber-700'] // gold, silver, bronze
const REVEAL_INTERVAL_MS = 1600

type RankGroup = { rank: number; members: Participant[] }

// Groups participants by competition rank: tied participants share the same rank,
// and the next rank skips by the size of the tied group (standard competition ranking).
function groupByRank(sorted: Participant[]): RankGroup[] {
  const groups: RankGroup[] = []
  let i = 0
  while (i < sorted.length) {
    const score = sorted[i].totalScore
    const members: Participant[] = []
    while (i < sorted.length && sorted[i].totalScore === score) members.push(sorted[i++])
    groups.push({ rank: i - members.length, members })
  }
  return groups
}

export function PodiumView({ participants, onEnd, strings }: { participants: Participant[]; onEnd: () => void; strings: Strings }) {
  const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore)
  const allGroups = groupByRank(sorted)

  // Only groups with rank 0, 1, or 2 appear on the podium — there may be fewer than
  // three if ties cause a rank to be skipped (e.g. two tied 1st means no 2nd place).
  const podiumGroups = allGroups.filter((g) => g.rank <= 2)
  // Reveal highest rank number first: 3rd → 2nd → 1st.
  const revealOrder = [...podiumGroups].sort((a, b) => b.rank - a.rank)
  // Runners-up: always show the first post-podium rank group; only add the second
  // group if the first has exactly one member (a tied first group already fills the slot).
  const postPodium = allGroups.filter((g) => g.rank > 2)
  const runnersUpGroups = postPodium[0]?.members.length === 1 ? postPodium.slice(0, 2) : postPodium.slice(0, 1)

  const [revealed, setRevealed] = useState(0)
  const s = strings.podium

  useEffect(() => {
    if (revealed >= podiumGroups.length) return
    const id = setTimeout(() => setRevealed((n) => n + 1), REVEAL_INTERVAL_MS)
    return () => clearTimeout(id)
  }, [revealed, podiumGroups.length])

  const visibleGroups = revealOrder.slice(0, revealed)
  const allRevealed = revealed >= podiumGroups.length

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
          {visibleGroups.map((group) => (
            <motion.div
              key={group.rank}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-2"
            >
              {group.rank === 0 && <span className="text-3xl">👑</span>}

              {/* Stack all tied members above the bar */}
              <div className="flex flex-col items-center gap-0.5">
                {group.members.map((p) => (
                  <p key={p.id} className="text-lg font-semibold leading-tight">{p.nickname}</p>
                ))}
              </div>
              <p className="tabular-nums text-slate-400">{group.members[0].totalScore} {s.pts}</p>

              {/* Bar grows upward from the ground */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ originY: 1 }}
                transition={{ type: 'spring', stiffness: 110, damping: 18, delay: 0.15 }}
                className={`flex w-28 items-start justify-center rounded-t-xl pt-3 ${PODIUM_COLORS[group.rank]} ${PLACE_HEIGHTS[group.rank]}`}
              >
                <span className="text-2xl font-bold">{s.placeLabel(group.rank)}</span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {allRevealed && runnersUpGroups.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm"
        >
          <p className="mb-3 text-center text-sm font-medium text-slate-500">{s.honorableMentions}</p>
          <ul className="flex flex-col gap-2">
            {runnersUpGroups.flatMap((group) =>
              group.members.map((p) => (
                <li key={p.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                  <span className="w-8 text-center text-sm font-bold text-slate-500">{s.placeLabel(group.rank)}</span>
                  <span className="flex-1 text-left font-medium">{p.nickname}</span>
                  <span className="tabular-nums text-slate-400">{p.totalScore} {s.pts}</span>
                </li>
              ))
            )}
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
