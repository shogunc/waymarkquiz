import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listQuestions, deleteQuestion, findQuizzesUsingQuestion } from '../../lib/questions'
import type { Question } from '../../types'

export function QuestionsListPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function reload() {
    setQuestions(await listQuestions())
  }

  useEffect(() => {
    void reload()
  }, [])

  async function handleDelete(question: Question) {
    setError(null)
    setBusyId(question.id)
    try {
      const usedBy = await findQuizzesUsingQuestion(question.id)
      if (usedBy.length > 0) {
        setError(`"${question.prompt}" is used by: ${usedBy.map((q) => q.title).join(', ')}. Remove it from those quizzes first.`)
        return
      }
      if (!confirm(`Delete "${question.prompt}"? This cannot be undone.`)) return
      await deleteQuestion(question.id)
      await reload()
    } catch (e) {
      setError(String(e))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Question library</h1>
        <Link to="new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500">
          New question
        </Link>
      </div>

      {error && <p className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300">{error}</p>}

      {questions === null && <p className="text-slate-400">Loading…</p>}
      {questions?.length === 0 && <p className="text-slate-400">No questions yet — create one to get started.</p>}

      <ul className="flex flex-col gap-3">
        {questions?.map((q) => (
          <li key={q.id} className="flex items-center gap-4 rounded-xl border border-slate-800 p-3">
            <img src={q.imageData} alt="" className="h-16 w-24 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-medium">{q.prompt}</p>
              <p className="text-sm text-slate-400">
                Correct year: {q.correctYear} · {q.trivia}
              </p>
            </div>
            <Link to={q.id} className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800">
              Edit
            </Link>
            <button
              onClick={() => void handleDelete(q)}
              disabled={busyId === q.id}
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
