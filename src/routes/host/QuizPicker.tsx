import { useEffect, useState } from 'react'
import { listQuizzes } from '../../lib/quizzes'
import { LANGUAGES } from '../../lib/strings'
import type { Language, Quiz } from '../../types'

export function QuizPicker({ onPick, busy }: { onPick: (quiz: Quiz, language: Language) => void; busy: boolean }) {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null)
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    void listQuizzes().then(setQuizzes)
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">Host a quiz</h1>
      <p className="text-slate-400">Pick a quiz from the library to start a session.</p>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">Session language</span>
        <div className="flex overflow-hidden rounded-lg border border-slate-700">
          {LANGUAGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setLanguage(value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                language === value ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

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
              onClick={() => onPick(quiz, language)}
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
