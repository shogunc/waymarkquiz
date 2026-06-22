import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import { db } from './firebase'

export interface Seed {
  id: string
  subject: string
  createdAt: number
}

const seedsCol = collection(db, 'seeds')

export async function listSeeds(): Promise<Seed[]> {
  const snap = await getDocs(query(seedsCol, orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, subject: d.data().subject as string, createdAt: d.data().createdAt as number }))
}

export async function addSeed(subject: string): Promise<void> {
  await addDoc(seedsCol, { subject: subject.trim(), createdAt: Date.now() })
}

export async function deleteSeed(id: string): Promise<void> {
  await deleteDoc(doc(seedsCol, id))
}
