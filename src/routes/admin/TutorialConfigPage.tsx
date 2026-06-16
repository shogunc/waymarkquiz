import { useEffect, useState } from 'react'
import { getTutorialQuestionId, setTutorialQuestionId } from '../../lib/config'
import { listQuestions, questionLanguages } from '../../lib/questions'
import type { Question } from '../../types'

function firstPrompt(q: Question): string {
  const langs = questionLanguages(q)
  const lang = langs[0]
  return (lang ? q.prompt[lang] : Object.values(q.prompt)[0]) ?? '(no prompt)'
}

export function TutorialConfigPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [currentId, setCurrentId] = useState<string | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void Promise.all([listQuestions(), getTutorialQuestionId()]).then(([qs, id]) => {
      setQuestions(qs)
      setCurrentId(id)
    })
  }, [])

  async function handleSelect(id: string | null) {
    setBusy(true)
    try {
      await setTutorialQuestionId(id)
      setCurrentId(id)
    } finally {
      setBusy(false)
    }
  }

  const current = questions?.find((q) => q.id === currentId) ?? null
  const loading = questions === null || currentId === undefined

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Tutorial example question</h1>
        <p className="mt-1 text-sm text-slate-400">
          This question is shown on the first two pages of the tutorial to illustrate the format and scoring.
        </p>
      </div>

      {loading && <p className="text-slate-400">Loading…</p>}

      {!loading && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-slate-400">Current example</h2>
            {current ? (
              <div className="flex items-center gap-4 rounded-xl border border-slate-800 p-3">
                <img src={current.imageData} alt="" className="h-16 w-24 flex-shrink-0 rounded-lg object-cover" />
                <p className="flex-1 font-medium">{firstPrompt(current)}</p>
                <button
                  onClick={() => void handleSelect(null)}
                  disabled={busy}
                  className="rounded-lg border border-red-900 px-3 py-1.5 text-sm text-red-300 hover:bg-red-950 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">None set — the tutorial will use a built-in illustration.</p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-slate-400">
              {current ? 'Pick a different question' : 'Pick a question from the library'}
            </h2>
            {questions.length === 0 && (
              <p className="text-sm text-slate-500">No questions in the library yet.</p>
            )}
            <ul className="flex flex-col gap-2">
              {questions.filter((q) => q.id !== currentId).map((q) => (
                <li key={q.id} className="flex items-center gap-4 rounded-xl border border-slate-800 p-3">
                  <img src={q.imageData} alt="" className="h-16 w-24 flex-shrink-0 rounded-lg object-cover" />
                  <p className="flex-1 text-sm">{firstPrompt(q)}</p>
                  <button
                    onClick={() => void handleSelect(q.id)}
                    disabled={busy}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800 disabled:opacity-50"
                  >
                    Use
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
