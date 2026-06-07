import { useState, type FormEvent } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuthUser } from '../../hooks/useAuthUser'

export function AdminLayout() {
  const user = useAuthUser()

  if (user === undefined) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-slate-950 text-slate-400">
        Loading…
      </main>
    )
  }

  if (user === null) {
    return <SignInForm />
  }

  return (
    <div className="min-h-svh bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <nav className="flex gap-4 text-sm font-medium">
          <NavLink
            to="questions"
            className={({ isActive }) => (isActive ? 'text-indigo-400' : 'text-slate-300 hover:text-slate-100')}
          >
            Questions
          </NavLink>
          <NavLink
            to="quizzes"
            className={({ isActive }) => (isActive ? 'text-indigo-400' : 'text-slate-300 hover:text-slate-100')}
          >
            Quizzes
          </NavLink>
        </nav>
        <button
          className="text-sm text-slate-400 hover:text-slate-100"
          onClick={() => void signOut(auth)}
        >
          Sign out ({user.email})
        </button>
      </header>
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  )
}

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Sign-in failed. Check the email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-950 text-slate-100">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-slate-800 p-8">
        <h1 className="text-xl font-semibold">Admin sign-in</h1>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
