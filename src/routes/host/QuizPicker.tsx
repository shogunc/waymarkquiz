import { useEffect, useState } from 'react'
import { listQuizzes } from '../../lib/quizzes'
import type { Quiz } from '../../types'

export function QuizPicker({ onPick, busy }: { onPick: (quiz: Quiz) => void; busy: boolean }) {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null)

  useEffect(() => {
    void listQuizzes().then(setQuizzes)
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">Host a quiz</h1>
      <p className="text-slate-400">Pick a quiz from the library to start a session.</p>

      {quizzes === null && <p className="text-slate-400">Loading…</p>}
      {quizzes?.length === 0 && <p className="text-slate-400">No quizzes yet — author one in the admin area first.</p>}

      <ul className="flex flex-col gap-3">
        {quizzes?.map((quiz) => (
          <li key={quiz.id} className="flex items-center gap-4 rounded-xl border border-slate-800 p-4">
            <div className="flex-1">
              <p className="font-medium">{quiz.title}</p>
              <p className="text-sm text-slate-400">
                {quiz.questionIds.length} question{quiz.questionIds.length === 1 ? '' : 's'} · {quiz.answerDurationSeconds}s per question
                {quiz.description ? ` · ${quiz.description}` : ''}
              </p>
            </div>
            <button
              onClick={() => onPick(quiz)}
              disabled={busy}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
            >
              {busy ? 'Starting…' : 'Start session'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
