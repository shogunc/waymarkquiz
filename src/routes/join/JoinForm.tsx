import { useState, type FormEvent } from 'react'

export function JoinForm({
  initialCode,
  onJoin,
  joining,
  error,
}: {
  initialCode: string
  onJoin: (code: string, nickname: string) => void
  joining: boolean
  error: string | null
}) {
  const [code, setCode] = useState(initialCode)
  const [nickname, setNickname] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!code.trim() || !nickname.trim()) return
    onJoin(code.trim(), nickname.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-center text-2xl font-semibold">Join a quiz</h1>
      <p className="text-center text-slate-400">Enter the join code shown on the host's screen.</p>

      <label className="flex flex-col gap-1 text-sm">
        Join code
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoCapitalize="characters"
          autoCorrect="off"
          maxLength={8}
          placeholder="e.g. ABCDE"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-center text-2xl tracking-[0.3em] uppercase outline-none focus:border-indigo-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Your nickname
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={24}
          placeholder="e.g. Alex"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-lg outline-none focus:border-indigo-500"
        />
      </label>

      {error && <p className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={joining || !code.trim() || !nickname.trim()}
        className="rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold hover:bg-indigo-500 disabled:opacity-40"
      >
        {joining ? 'Joining…' : 'Join'}
      </button>
    </form>
  )
}
