import { useEffect, useState } from 'react'
import { LanguageBadge, LanguageBadges } from '../../components/LanguageBadge'
import { listQuizzes } from '../../lib/quizzes'
import { LANGUAGES } from '../../lib/strings'
import type { Language, Quiz } from '../../types'

const DEFAULT_ANSWER_DURATION_SECONDS = 20

export function QuizPicker({
  onPick,
  busy,
}: {
  onPick: (quiz: Quiz, language: Language, answerDurationSeconds: number) => void
  busy: boolean
}) {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [answerDurationSeconds, setAnswerDurationSeconds] = useState(DEFAULT_ANSWER_DURATION_SECONDS)

  useEffect(() => {
    void listQuizzes().then(setQuizzes)
  }, [])

  const validDuration = Number.isFinite(answerDurationSeconds) && answerDurationSeconds > 0

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">Host a quiz</h1>
      <p className="text-slate-400">Pick a quiz from the library to start a session.</p>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
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
                <LanguageBadge lang={value} /> {label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-400">
          Answer time per question
          <input
            type="number"
            min={1}
            value={answerDurationSeconds}
            onChange={(e) => setAnswerDurationSeconds(e.target.valueAsNumber)}
            className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
          />
          seconds
        </label>
      </div>

      {quizzes === null && <p className="text-slate-400">Loading…</p>}
      {quizzes?.length === 0 && <p className="text-slate-400">No quizzes yet — author one in the admin area first.</p>}

      <ul className="flex flex-col gap-3">
        {quizzes?.map((quiz) => {
          const supported = quiz.supportedLanguages.includes(language)
          return (
            <li key={quiz.id} className={`flex items-center gap-4 rounded-xl border border-slate-800 p-4 transition-opacity ${supported ? '' : 'opacity-40'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{quiz.title}</p>
                  <LanguageBadges langs={quiz.supportedLanguages} />
                </div>
                <p className="text-sm text-slate-400">
                  {quiz.questionIds.length} question{quiz.questionIds.length === 1 ? '' : 's'}
                  {quiz.description ? ` · ${quiz.description}` : ''}
                </p>
              </div>
              <button
                onClick={() => onPick(quiz, language, answerDurationSeconds)}
                disabled={busy || !validDuration || !supported}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
              >
                {busy ? 'Starting…' : 'Start session'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
