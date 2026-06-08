import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listQuestions } from '../../lib/questions'
import { createQuiz, getQuiz, updateQuiz } from '../../lib/quizzes'
import type { Question } from '../../types'

export function QuizEditorPage() {
  const { id } = useParams()
  const isNew = id === undefined
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [answerDurationSeconds, setAnswerDurationSeconds] = useState(20)
  const [questionIds, setQuestionIds] = useState<string[]>([])
  const [library, setLibrary] = useState<Question[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const [questions, quiz] = await Promise.all([listQuestions(), isNew ? null : getQuiz(id)])
      setLibrary(questions)
      if (!isNew) {
        if (!quiz) {
          setError('Quiz not found.')
        } else {
          setTitle(quiz.title)
          setDescription(quiz.description ?? '')
          setAnswerDurationSeconds(quiz.answerDurationSeconds)
          setQuestionIds(quiz.questionIds)
        }
      }
      setLoading(false)
    })()
  }, [id, isNew])

  const byId = useMemo(() => new Map((library ?? []).map((q) => [q.id, q])), [library])
  const available = useMemo(() => (library ?? []).filter((q) => !questionIds.includes(q.id)), [library, questionIds])

  function add(questionId: string) {
    setQuestionIds((ids) => [...ids, questionId])
  }
  function remove(index: number) {
    setQuestionIds((ids) => ids.filter((_, i) => i !== index))
  }
  function move(index: number, delta: number) {
    setQuestionIds((ids) => {
      const target = index + delta
      if (target < 0 || target >= ids.length) return ids
      const next = [...ids]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim()) return setError('Add a title.')
    if (questionIds.length === 0) return setError('Add at least one question.')
    if (!Number.isFinite(answerDurationSeconds) || answerDurationSeconds <= 0) {
      return setError('Answer duration must be a positive number of seconds.')
    }

    setSaving(true)
    try {
      const input = { title: title.trim(), description: description.trim() || undefined, questionIds, answerDurationSeconds }
      if (isNew) {
        await createQuiz(input)
      } else {
        await updateQuiz(id, input)
      }
      navigate('..')
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-slate-400">Loading…</p>

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto flex max-w-4xl flex-col gap-6">
      <h1 className="text-xl font-semibold">{isNew ? 'New quiz' : 'Edit quiz'}</h1>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description (optional)
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>
        <label className="flex max-w-xs flex-col gap-1 text-sm">
          Answer time per question (seconds)
          <input
            type="number"
            min={1}
            value={answerDurationSeconds}
            onChange={(e) => setAnswerDurationSeconds(e.target.valueAsNumber)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-slate-400">In this quiz ({questionIds.length})</h2>
          {questionIds.length === 0 && <p className="text-sm text-slate-500">No questions added yet.</p>}
          <ul className="flex flex-col gap-2">
            {questionIds.map((qid, index) => {
              const q = byId.get(qid)
              return (
                <li key={qid} className="flex items-center gap-3 rounded-lg border border-slate-800 p-2">
                  <span className="w-5 text-center text-sm text-slate-500">{index + 1}</span>
                  {q ? (
                    <img src={q.imageData} alt="" className="h-10 w-14 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-14 rounded bg-slate-800" />
                  )}
                  <span className="flex-1 truncate text-sm">{q?.prompt ?? 'Unknown question'}</span>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 disabled:opacity-30">
                    ↑
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === questionIds.length - 1} className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 disabled:opacity-30">
                    ↓
                  </button>
                  <button type="button" onClick={() => remove(index)} className="rounded border border-red-900 px-2 py-1 text-xs text-red-300 hover:bg-red-950">
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-slate-400">Library ({available.length} available)</h2>
          {available.length === 0 && <p className="text-sm text-slate-500">No more questions to add — author some in the question library.</p>}
          <ul className="flex flex-col gap-2">
            {available.map((q) => (
              <li key={q.id} className="flex items-center gap-3 rounded-lg border border-slate-800 p-2">
                <img src={q.imageData} alt="" className="h-10 w-14 rounded object-cover" />
                <span className="flex-1 truncate text-sm">{q.prompt}</span>
                <button type="button" onClick={() => add(q.id)} className="rounded border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800">
                  Add
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {error && <p className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={() => navigate('..')} className="rounded-lg border border-slate-700 px-4 py-2 font-medium hover:bg-slate-800">
          Cancel
        </button>
      </div>
    </form>
  )
}
