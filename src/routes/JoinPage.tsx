import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ensureSignedIn } from '../lib/auth'
import { getSession, getSessionByJoinCode } from '../lib/sessions'
import { joinSession } from '../lib/participants'
import { JoinForm } from './join/JoinForm'
import { PlaySession } from './join/PlaySession'

const STORAGE_KEY = 'waymarkquiz:participant-session'

type StoredSession = { sessionId: string; joinCode: string }

function loadStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    return parsed.sessionId && parsed.joinCode ? (parsed as StoredSession) : null
  } catch {
    return null
  }
}

function storeSession(value: StoredSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY)
}

export function JoinPage() {
  const [searchParams] = useSearchParams()
  const [uid, setUid] = useState<string | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null | undefined>(undefined)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void ensureSignedIn().then((user) => setUid(user.uid))
  }, [])

  // On first load, try to resume a session we already joined (reconnection — see CLAUDE.md).
  useEffect(() => {
    if (!uid) return
    const stored = loadStoredSession()
    if (!stored) {
      setActiveSessionId(null)
      return
    }
    void getSession(stored.sessionId).then((session) => {
      if (session && session.phase !== 'ended') {
        setActiveSessionId(session.id)
      } else {
        clearStoredSession()
        setActiveSessionId(null)
      }
    })
  }, [uid])

  async function handleJoin(code: string, nickname: string) {
    if (!uid) return
    setJoining(true)
    setError(null)
    try {
      const session = await getSessionByJoinCode(code)
      if (!session) {
        setError('No quiz found with that code — double-check and try again.')
        return
      }
      if (session.phase !== 'lobby') {
        setError('This quiz has already started — ask the host for a new code.')
        return
      }
      await joinSession(session.id, uid, nickname)
      storeSession({ sessionId: session.id, joinCode: session.joinCode })
      setActiveSessionId(session.id)
    } catch (e) {
      setError(String(e))
    } finally {
      setJoining(false)
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-slate-100">
      {!uid || activeSessionId === undefined ? (
        <p className="text-slate-400">Loading…</p>
      ) : activeSessionId ? (
        <PlaySession sessionId={activeSessionId} uid={uid} />
      ) : (
        <JoinForm initialCode={searchParams.get('code') ?? ''} onJoin={(code, nickname) => void handleJoin(code, nickname)} joining={joining} error={error} />
      )}
    </main>
  )
}
