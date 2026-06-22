import { useEffect, useState } from 'react'
import { getSimulatedCrowdEnabled, setSimulatedCrowdEnabled } from '../../lib/config'

export function SettingsPage() {
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void getSimulatedCrowdEnabled().then(setEnabled)
  }, [])

  async function handleToggle() {
    if (enabled === undefined) return
    setBusy(true)
    try {
      const next = !enabled
      await setSimulatedCrowdEnabled(next)
      setEnabled(next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">App-wide settings for testing and running sessions.</p>
      </div>

      {enabled === undefined && <p className="text-slate-400">Loading…</p>}

      {enabled !== undefined && (
        <section className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 p-4">
          <div>
            <h2 className="font-medium">Simulated crowd</h2>
            <p className="mt-1 text-sm text-slate-400">
              Mixes ~20 fake participants who answer randomly in alongside whoever actually joins — useful for
              testing standings and the podium with a fuller crowd. Remember to turn this off before a real party
              if you don't want it skewing the standings.
            </p>
          </div>
          <button
            onClick={() => void handleToggle()}
            disabled={busy}
            className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${
              enabled ? 'bg-indigo-600 hover:bg-indigo-500' : 'border border-slate-700 hover:bg-slate-800'
            }`}
          >
            {enabled ? 'On' : 'Off'}
          </button>
        </section>
      )}
    </div>
  )
}
