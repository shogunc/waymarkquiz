import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Question, Quiz } from '../types'

const questionsCol = collection(db, 'questions')
const quizzesCol = collection(db, 'quizzes')

export type QuestionInput = {
  imageData: string
  trivia: string
  prompt: string
  correctYear: number
}

export async function listQuestions(): Promise<Question[]> {
  const snap = await getDocs(query(questionsCol, orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Question, 'id'>) }))
}

export async function getQuestion(id: string): Promise<Question | null> {
  const snap = await getDoc(doc(questionsCol, id))
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Question, 'id'>) } : null
}

export async function createQuestion(input: QuestionInput): Promise<string> {
  const now = Date.now()
  const ref = await addDoc(questionsCol, { ...input, createdAt: now, updatedAt: now })
  return ref.id
}

export async function updateQuestion(id: string, input: QuestionInput): Promise<void> {
  await updateDoc(doc(questionsCol, id), { ...input, updatedAt: Date.now() })
}

/** Quizzes (id + title) that reference this question — used to guard deletion. */
export async function findQuizzesUsingQuestion(questionId: string): Promise<Pick<Quiz, 'id' | 'title'>[]> {
  const snap = await getDocs(query(quizzesCol, where('questionIds', 'array-contains', questionId)))
  return snap.docs.map((d) => ({ id: d.id, title: (d.data() as Quiz).title }))
}

/**
 * Throws if the question is still referenced by any quiz — the admin UI is
 * expected to check `findQuizzesUsingQuestion` first and show the author which
 * quizzes to update, rather than relying on this throwing (see CLAUDE.md:
 * "Deletion guard").
 */
export async function deleteQuestion(id: string): Promise<void> {
  const usedBy = await findQuizzesUsingQuestion(id)
  if (usedBy.length > 0) {
    throw new Error(`Question is still used by: ${usedBy.map((q) => q.title).join(', ')}`)
  }
  await deleteDoc(doc(questionsCol, id))
}
