import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSeeds, addSeed, deleteSeed, type Seed } from '../../lib/seeds'

export function SeedsPage() {
  const [seeds, setSeeds] = useState<Seed[] | null>(null)
  const [newSubject, setNewSubject] = useState('')
  const [adding, setAdding] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  async function reload() {
    setSeeds(await listSeeds())
  }

  useEffect(() => {
    void reload()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubject.trim()) return
    setAdding(true)
    try {
      await addSeed(newSubject)
      setNewSubject('')
      await reload()
      inputRef.current?.focus()
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id)
    try {
      await deleteSeed(id)
      await reload()
    } finally {
      setBusyId(null)
    }
  }

  function handleCreateQuestion(seed: Seed) {
    void navigate('/admin/questions/new', { state: { seedSubject: seed.subject, seedId: seed.id } })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Question seeds</h1>
        <p className="mt-1 text-sm text-slate-400">
          Jot down ideas for questions before you're ready to write them.
        </p>
      </div>

      <form onSubmit={(e) => void handleAdd(e)} className="flex gap-3">
        <input
          ref={inputRef}
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="e.g. Apollo 11 moon landing"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500 placeholder:text-slate-600"
        />
        <button
          type="submit"
          disabled={adding || !newSubject.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {seeds === null && <p className="text-slate-400">Loading…</p>}
      {seeds?.length === 0 && (
        <p className="text-sm text-slate-500">No seeds yet — add one above.</p>
      )}

      {seeds && seeds.length > 0 && (
        <ul className="flex flex-col gap-2">
          {seeds.map((seed) => (
            <li
              key={seed.id}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3"
            >
              <p className="flex-1 text-slate-200">{seed.subject}</p>
              <button
                onClick={() => handleCreateQuestion(seed)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
              >
                Create question
              </button>
              <button
                onClick={() => void handleDelete(seed.id)}
                disabled={busyId === seed.id}
                className="rounded-lg border border-red-900 px-3 py-1.5 text-sm text-red-300 hover:bg-red-950 disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
