import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'
import type { Language, Quiz } from '../types'

const quizzesCol = collection(db, 'quizzes')

export type QuizInput = {
  title: string
  description?: string
  questionIds: string[]
  supportedLanguages: Language[]
}

// Existing quiz documents lack supportedLanguages — default to ['sv'] since all
// pre-migration content is Swedish.
function normalizeQuiz(id: string, data: Record<string, unknown>): Quiz {
  return {
    id,
    title: data.title as string,
    description: data.description as string | undefined,
    questionIds: data.questionIds as string[],
    supportedLanguages: (data.supportedLanguages as Language[] | undefined) ?? ['sv'],
    createdAt: data.createdAt as number,
    updatedAt: data.updatedAt as number,
  }
}

export async function listQuizzes(): Promise<Quiz[]> {
  const snap = await getDocs(query(quizzesCol, orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => normalizeQuiz(d.id, d.data()))
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  const snap = await getDoc(doc(quizzesCol, id))
  return snap.exists() ? normalizeQuiz(snap.id, snap.data()) : null
}

// Firestore rejects `undefined` field values — drop `description` entirely when absent
// rather than writing it as undefined (addDoc/updateDoc throw on undefined values).
function toFirestoreData(input: QuizInput) {
  const { description, ...rest } = input
  return description === undefined ? rest : { ...rest, description }
}

export async function createQuiz(input: QuizInput): Promise<string> {
  const now = Date.now()
  const ref = await addDoc(quizzesCol, { ...toFirestoreData(input), createdAt: now, updatedAt: now })
  return ref.id
}

export async function updateQuiz(id: string, input: QuizInput): Promise<void> {
  await updateDoc(doc(quizzesCol, id), { ...toFirestoreData(input), updatedAt: Date.now() })
}

export async function deleteQuiz(id: string): Promise<void> {
  await deleteDoc(doc(quizzesCol, id))
}
