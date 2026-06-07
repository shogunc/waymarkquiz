// Core domain types, mirroring the Firestore data model described in CLAUDE.md.
// These are the shapes shared by the host, participant, and admin views.

export interface Question {
  id: string
  imageUrl: string
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
  hostToken: string
  quizId: string
  phase: SessionPhase
  currentQuestionIndex: number
  /** Epoch ms; clients render their own countdown from this. */
  answerWindowEndsAt: number | null
  createdAt: number
}

export interface Participant {
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
