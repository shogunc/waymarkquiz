import { QRCodeSVG } from 'qrcode.react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Participant, Quiz, Session } from '../../types'

export function LobbyView({
  session,
  quiz,
  participants,
  onStart,
  starting,
}: {
  session: Session
  quiz: Quiz
  participants: Participant[]
  onStart: () => void
  starting: boolean
}) {
  const joinUrl = `${window.location.origin}/join?code=${session.joinCode}`

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 text-center">
      <div>
        <p className="text-slate-400">{quiz.title}</p>
        <h1 className="text-lg text-slate-400">Join at <span className="font-medium text-slate-200">{joinUrl.replace(/^https?:\/\//, '')}</span></h1>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-white p-4">
          <QRCodeSVG value={joinUrl} size={200} />
        </div>
        <p className="text-5xl font-bold tracking-[0.3em]">{session.joinCode}</p>
      </div>

      <div className="w-full">
        <h2 className="mb-3 text-sm font-medium text-slate-400">
          {participants.length === 0 ? 'Waiting for players…' : `${participants.length} player${participants.length === 1 ? '' : 's'} joined`}
        </h2>
        <ul className="flex flex-wrap justify-center gap-2">
          <AnimatePresence>
            {participants.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium"
              >
                {p.nickname}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <button
        onClick={onStart}
        disabled={participants.length === 0 || starting}
        className="rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold hover:bg-indigo-500 disabled:opacity-40"
      >
        {starting ? 'Starting…' : 'Start quiz'}
      </button>
    </div>
  )
}
