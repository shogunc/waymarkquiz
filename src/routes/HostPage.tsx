export function HostPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
      <h1 className="text-2xl font-semibold">Host</h1>
      <p className="text-slate-400">Pick a quiz from the library and start a session.</p>
      {/* TODO: quiz picker -> create session (joinCode + hostToken) -> lobby/question/standings/podium phases */}
    </main>
  )
}
