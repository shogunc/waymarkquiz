// Core domain types, mirroring the Firestore data model described in CLAUDE.md.
// These are the shapes shared by the host, participant, and admin views.

export interface Question {
  id: string
  /** Base64 data-URI string; resized/compressed client-side before storage. */
  imageData: string
  trivia: string
  prompt: string
  correctYear: number
  createdAt: number
  updatedAt: number
}

export interface Quiz {
  id: string
  title: string
  description?: string
  questionIds: string[]
  createdAt: number
  updatedAt: number
}

export type SessionPhase =
  | 'lobby'
  | 'question'
  | 'answering'
  | 'reveal'
  | 'standings'
  | 'podium'
  | 'ended'

export interface Session {
  id: string
  joinCode: string
  /** The host's anonymous-auth UID — security rules gate state/score writes on this. */
  hostUid: string
  quizId: string
  phase: SessionPhase
  currentQuestionIndex: number
  /** Epoch ms; clients render their own countdown from this. */
  answerWindowEndsAt: number | null
  createdAt: number
}

export interface Participant {
  /** The participant's anonymous-auth UID — also the document ID. */
  id: string
  nickname: string
  joinedAt: number
  totalScore: number
}

export interface Answer {
  participantId: string
  questionIndex: number
  guessedYear: number
  submittedAt: number
  /** Filled in by the host once the answer window closes. */
  pointsEarned: number | null
}
