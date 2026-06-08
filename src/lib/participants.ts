import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'
import type { Participant } from '../types'

function participantsCol(sessionId: string) {
  return collection(db, 'sessions', sessionId, 'participants')
}

function fromDoc(d: { id: string; data: () => unknown }): Participant {
  return { id: d.id, ...(d.data() as Omit<Participant, 'id'>) }
}

/** Creates (or re-creates, on reconnect) the joining participant's own document. */
export async function joinSession(sessionId: string, uid: string, nickname: string): Promise<void> {
  await setDoc(doc(participantsCol(sessionId), uid), {
    nickname,
    joinedAt: Date.now(),
    totalScore: 0,
  })
}

export function subscribeToParticipants(sessionId: string, onChange: (participants: Participant[]) => void): () => void {
  return onSnapshot(query(participantsCol(sessionId), orderBy('joinedAt', 'asc')), (snap) => {
    onChange(snap.docs.map(fromDoc))
  })
}

export function subscribeToParticipant(sessionId: string, participantId: string, onChange: (participant: Participant | null) => void): () => void {
  return onSnapshot(doc(participantsCol(sessionId), participantId), (snap) => {
    onChange(snap.exists() ? fromDoc(snap) : null)
  })
}

/** Host-only: write a participant's running total after scoring a question. */
export async function setParticipantScore(sessionId: string, participantId: string, totalScore: number): Promise<void> {
  await updateDoc(doc(participantsCol(sessionId), participantId), { totalScore })
}
