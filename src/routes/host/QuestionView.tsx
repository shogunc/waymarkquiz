import { useEffect, useState } from 'react'
import type { Answer, Participant, Question, Session } from '../../types'
import type { Strings } from '../../lib/strings'

/**
 * Renders both the `preview` and `answering` phases from one component so the
 * image and trivia stay in exactly the same spot when the host reveals the
 * question — no remount, no layout shift, just the prompt fading in and the
 * countdown/answer-count replacing the reveal button.
 */
export function QuestionView({
  session,
  question,
  questionNumber,
  totalQuestions,
  participants,
  answers,
  revealed,
  onReveal,
  revealing,
  strings,
}: {
  session: Session
  question: Question
  questionNumber: number
  totalQuestions: number
  participants: Participant[]
  answers: Answer[]
  revealed: boolean
  onReveal: () => void
  revealing: boolean
  strings: Strings
}) {
  const s = strings.answering
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!revealed) return
    const id = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(id)
  }, [revealed])

  const remainingMs = Math.max(0, (session.answerWindowEndsAt ?? now) - now)
  const remainingSeconds = Math.ceil(remainingMs / 1000)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
      <p className="text-slate-400">{s.questionXOfY(questionNumber, totalQuestions)}</p>

      <img src={question.imageData} alt="" className="max-h-[40vh] rounded-2xl object-contain shadow-2xl" />

      <p className="max-w-2xl text-lg text-slate-300">{question.trivia}</p>

      <p className={`text-2xl font-semibold transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
        {question.prompt}
      </p>

      {revealed ? (
        <>
          <div className="flex flex-col items-center gap-1">
            <p className="text-6xl font-bold tabular-nums">{remainingSeconds}</p>
            <p className="text-sm text-slate-400">{s.secondsLeft}</p>
          </div>

          <p className="text-slate-400">{s.xOfYAnswered(answers.length, participants.length)}</p>
        </>
      ) : (
        <button
          onClick={onReveal}
          disabled={revealing}
          className="rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold hover:bg-indigo-500 disabled:opacity-40"
        >
          {strings.preview.revealQuestion}
        </button>
      )}
    </div>
  )
}
