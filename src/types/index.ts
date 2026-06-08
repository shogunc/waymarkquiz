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
  /** How long participants get to answer each question in this quiz. */
  answerDurationSeconds: number
  createdAt: number
  updatedAt: number
}

/**
 * Session-level phases — the synced states that drive what every client
 * renders. Deliberately fewer than the conceptual steps in CLAUDE.md's game
 * flow: "question" and "answering" collapse into one (`answering`), since the
 * answer window opens the instant the question appears — there's no separate
 * "preview" period. "Personal reveal" isn't a synced phase at all; it's a
 * transient, participant-local state (shown once their own answer document
 * gains a `pointsEarned` value), not something that needs to be globally
 * synced via the session document.
 */
export type SessionPhase = 'lobby' | 'answering' | 'standings' | 'podium' | 'ended'

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
