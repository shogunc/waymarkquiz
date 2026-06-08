import { collection, doc, setDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from './firebase'
import type { Answer } from '../types'

function answersCol(sessionId: string) {
  return collection(db, 'sessions', sessionId, 'answers')
}

/** One answer per participant per question — deterministic ID prevents duplicate submissions. */
function answerDocId(participantId: string, questionIndex: number): string {
  return `${participantId}_q${questionIndex}`
}

function fromDoc(d: { data: () => unknown }): Answer {
  return d.data() as Answer
}

export async function submitAnswer(sessionId: string, participantId: string, questionIndex: number, guessedYear: number): Promise<void> {
  await setDoc(doc(answersCol(sessionId), answerDocId(participantId, questionIndex)), {
    participantId,
    questionIndex,
    guessedYear,
    submittedAt: Date.now(),
    pointsEarned: null,
  })
}

export function subscribeToAnswer(
  sessionId: string,
  participantId: string,
  questionIndex: number,
  onChange: (answer: Answer | null) => void,
): () => void {
  return onSnapshot(doc(answersCol(sessionId), answerDocId(participantId, questionIndex)), (snap) => {
    onChange(snap.exists() ? (snap.data() as Answer) : null)
  })
}

export function subscribeToAnswersForQuestion(
  sessionId: string,
  questionIndex: number,
  onChange: (answers: Answer[]) => void,
): () => void {
  return onSnapshot(query(answersCol(sessionId), where('questionIndex', '==', questionIndex)), (snap) => {
    onChange(snap.docs.map(fromDoc))
  })
}

/** Host-only: fill in the points earned once the answer window closes. */
export async function scoreAnswer(sessionId: string, participantId: string, questionIndex: number, pointsEarned: number): Promise<void> {
  await updateDoc(doc(answersCol(sessionId), answerDocId(participantId, questionIndex)), { pointsEarned })
}
