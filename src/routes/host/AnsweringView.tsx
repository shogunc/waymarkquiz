import { useEffect, useState } from 'react'
import type { Answer, Participant, Question, Session } from '../../types'

export function AnsweringView({
  session,
  question,
  questionNumber,
  totalQuestions,
  participants,
  answers,
}: {
  session: Session
  question: Question
  questionNumber: number
  totalQuestions: number
  participants: Participant[]
  answers: Answer[]
}) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(id)
  }, [])

  const remainingMs = Math.max(0, (session.answerWindowEndsAt ?? now) - now)
  const remainingSeconds = Math.ceil(remainingMs / 1000)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
      <p className="text-slate-400">
        Question {questionNumber} of {totalQuestions}
      </p>

      <img src={question.imageData} alt="" className="max-h-[40vh] rounded-2xl object-contain shadow-2xl" />

      <p className="max-w-2xl text-lg text-slate-300">{question.trivia}</p>
      <p className="text-2xl font-semibold">{question.prompt}</p>

      <div className="flex flex-col items-center gap-1">
        <p className="text-6xl font-bold tabular-nums">{remainingSeconds}</p>
        <p className="text-sm text-slate-400">seconds left</p>
      </div>

      <p className="text-slate-400">
        {answers.length} of {participants.length} answered
      </p>
    </div>
  )
}
