import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const tutorialDoc = doc(db, 'config', 'tutorial')
const simulatedCrowdDoc = doc(db, 'config', 'simulatedCrowd')

export async function getTutorialQuestionId(): Promise<string | null> {
  const snap = await getDoc(tutorialDoc)
  return snap.exists() ? ((snap.data().tutorialQuestionId as string) ?? null) : null
}

export async function setTutorialQuestionId(id: string | null): Promise<void> {
  await setDoc(tutorialDoc, { tutorialQuestionId: id })
}

export async function getSimulatedCrowdEnabled(): Promise<boolean> {
  const snap = await getDoc(simulatedCrowdDoc)
  return snap.exists() ? Boolean(snap.data().enabled) : false
}

export async function setSimulatedCrowdEnabled(enabled: boolean): Promise<void> {
  await setDoc(simulatedCrowdDoc, { enabled })
}
