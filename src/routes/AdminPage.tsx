export function AdminPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-slate-400">Sign in to manage the question library and quizzes.</p>
      {/* TODO: shared-password sign-in, question library CRUD, quiz playlist builder */}
    </main>
  )
}
