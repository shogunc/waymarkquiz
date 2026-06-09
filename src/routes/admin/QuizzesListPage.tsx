import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LanguageBadges } from '../../components/LanguageBadge'
import { listQuizzes, deleteQuiz } from '../../lib/quizzes'
import type { Quiz } from '../../types'

export function QuizzesListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function reload() {
    setQuizzes(await listQuizzes())
  }

  useEffect(() => {
    void reload()
  }, [])

  async function handleDelete(quiz: Quiz) {
    if (!confirm(`Delete "${quiz.title}"? This cannot be undone.`)) return
    setBusyId(quiz.id)
    try {
      await deleteQuiz(quiz.id)
      await reload()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quizzes</h1>
        <Link to="new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500">
          New quiz
        </Link>
      </div>

      {quizzes === null && <p className="text-slate-400">Loading…</p>}
      {quizzes?.length === 0 && <p className="text-slate-400">No quizzes yet — create one to get started.</p>}

      <ul className="flex flex-col gap-3">
        {quizzes?.map((quiz) => (
          <li key={quiz.id} className="flex items-center gap-4 rounded-xl border border-slate-800 p-3">
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
            <Link to={quiz.id} className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800">
              Edit
            </Link>
            <button
              onClick={() => void handleDelete(quiz)}
              disabled={busyId === quiz.id}
              className="rounded-lg border border-red-900 px-3 py-1.5 text-sm text-red-300 hover:bg-red-950 disabled:opacity-50"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
