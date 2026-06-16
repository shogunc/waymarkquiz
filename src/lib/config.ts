import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const tutorialDoc = doc(db, 'config', 'tutorial')

export async function getTutorialQuestionId(): Promise<string | null> {
  const snap = await getDoc(tutorialDoc)
  return snap.exists() ? ((snap.data().tutorialQuestionId as string) ?? null) : null
}

export async function setTutorialQuestionId(id: string | null): Promise<void> {
  await setDoc(tutorialDoc, { tutorialQuestionId: id })
}
