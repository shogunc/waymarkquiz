import { collection, doc, getDoc, addDoc, getDocs, onSnapshot, updateDoc, query, where, limit } from 'firebase/firestore'
import { db } from './firebase'
import type { Language, Session } from '../types'

const sessionsCol = collection(db, 'sessions')

// Excludes visually ambiguous characters (I, O, 0, 1) so codes are easy to read aloud and type.
const JOIN_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const JOIN_CODE_LENGTH = 5
const MAX_JOIN_CODE_ATTEMPTS = 5

function randomJoinCode(): string {
  let code = ''
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)]
  }
  return code
}

function fromDoc(d: { id: string; data: () => unknown }): Session {
  return { id: d.id, ...(d.data() as Omit<Session, 'id'>) }
}

async function joinCodeExists(joinCode: string): Promise<boolean> {
  const snap = await getDocs(query(sessionsCol, where('joinCode', '==', joinCode), limit(1)))
  return !snap.empty
}

export async function createSession(quizId: string, hostUid: string, language: Language, answerDurationSeconds: number): Promise<Session> {
  for (let attempt = 0; attempt < MAX_JOIN_CODE_ATTEMPTS; attempt++) {
    const joinCode = randomJoinCode()
    if (await joinCodeExists(joinCode)) continue

    const data: Omit<Session, 'id'> = {
      joinCode,
      hostUid,
      quizId,
      phase: 'lobby',
      language,
      answerDurationSeconds,
      currentQuestionIndex: 0,
      answerWindowEndsAt: null,
      createdAt: Date.now(),
    }
    const ref = await addDoc(sessionsCol, data)
    return { id: ref.id, ...data }
  }
  throw new Error('Could not generate a unique join code — please try again.')
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const snap = await getDoc(doc(sessionsCol, sessionId))
  return snap.exists() ? fromDoc(snap) : null
}

export async function getSessionByJoinCode(joinCode: string): Promise<Session | null> {
  const snap = await getDocs(query(sessionsCol, where('joinCode', '==', joinCode.toUpperCase()), limit(1)))
  return snap.empty ? null : fromDoc(snap.docs[0])
}

export function subscribeToSession(sessionId: string, onChange: (session: Session | null) => void): () => void {
  return onSnapshot(doc(sessionsCol, sessionId), (snap) => {
    onChange(snap.exists() ? fromDoc(snap) : null)
  })
}

export type SessionPatch = Partial<Pick<Session, 'phase' | 'currentQuestionIndex' | 'answerWindowEndsAt'>>

/** Host-only: advance the session's synced state. Security rules restrict this to `hostUid`. */
export async function patchSession(sessionId: string, patch: SessionPatch): Promise<void> {
  await updateDoc(doc(sessionsCol, sessionId), patch)
}
