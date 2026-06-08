import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'
import type { Quiz } from '../types'

const quizzesCol = collection(db, 'quizzes')

export type QuizInput = {
  title: string
  description?: string
  questionIds: string[]
}

export async function listQuizzes(): Promise<Quiz[]> {
  const snap = await getDocs(query(quizzesCol, orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Quiz, 'id'>) }))
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  const snap = await getDoc(doc(quizzesCol, id))
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Quiz, 'id'>) } : null
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
