export function JoinPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
      <h1 className="text-2xl font-semibold">Join a quiz</h1>
      <p className="text-slate-400">Enter the join code shown on the host's screen.</p>
      {/* TODO: join-code input + nickname entry, persisted participant ID for reconnection */}
    </main>
  )
}
