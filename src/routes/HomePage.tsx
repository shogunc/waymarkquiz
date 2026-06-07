import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-950 text-slate-100">
      <h1 className="text-4xl font-bold tracking-tight">Waymark Quiz</h1>
      <nav className="flex flex-col gap-3">
        <Link className="rounded-lg bg-indigo-600 px-6 py-3 text-center font-medium hover:bg-indigo-500" to="/join">
          Join a quiz
        </Link>
        <Link className="rounded-lg bg-slate-800 px-6 py-3 text-center font-medium hover:bg-slate-700" to="/host">
          Host a quiz
        </Link>
        <Link className="rounded-lg bg-slate-800 px-6 py-3 text-center font-medium hover:bg-slate-700" to="/admin">
          Admin
        </Link>
      </nav>
    </main>
  )
}
