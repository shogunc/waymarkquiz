import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { subscribeToSession } from '../../lib/sessions'
import { subscribeToParticipant } from '../../lib/participants'
import { subscribeToAnswer, submitAnswer } from '../../lib/answers'
import { getQuiz } from '../../lib/quizzes'
import { getQuestion } from '../../lib/questions'
import { YearPicker } from './YearPicker'
import type { Answer, Participant, Question, Quiz, Session } from '../../types'

const REVEAL_DURATION_MS = 3500

export function PlaySession({ sessionId, uid }: { sessionId: string; uid: string }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [revealQuestionIndex, setRevealQuestionIndex] = useState<number | null>(null)

  const seenStandingsFor = useRef<number | null>(null)

  useEffect(() => subscribeToSession(sessionId, setSession), [sessionId])
  useEffect(() => subscribeToParticipant(sessionId, uid, setParticipant), [sessionId, uid])

  useEffect(() => {
    if (!session) return
    void getQuiz(session.quizId).then(async (q) => {
      setQuiz(q)
      if (q) setQuestions(await Promise.all(q.questionIds.map((id) => getQuestion(id))).then((qs) => qs.filter((x): x is Question => x !== null)))
    })
  }, [session?.quizId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track our own answer to the question currently in play.
  useEffect(() => {
    if (!session || (session.phase !== 'answering' && session.phase !== 'standings')) {
      setAnswer(null)
      return
    }
    return subscribeToAnswer(sessionId, uid, session.currentQuestionIndex, setAnswer)
  }, [sessionId, uid, session?.phase, session?.currentQuestionIndex])

  // Personal reveal: a transient, local moment shown once when the host moves to standings
  // for a question we just played — independent of the synced session phase (see CLAUDE.md).
  useEffect(() => {
    if (!session || session.phase !== 'standings') return
    if (seenStandingsFor.current === session.currentQuestionIndex) return
    seenStandingsFor.current = session.currentQuestionIndex
    setRevealQuestionIndex(session.currentQuestionIndex)
    const id = setTimeout(() => setRevealQuestionIndex(null), REVEAL_DURATION_MS)
    return () => clearTimeout(id)
  }, [session?.phase, session?.currentQuestionIndex])

  async function handlePick(year: number) {
    if (!session) return
    setSubmitting(true)
    try {
      await submitAnswer(sessionId, uid, session.currentQuestionIndex, year)
    } finally {
      setSubmitting(false)
    }
  }

  if (session === undefined || !participant) {
    return <p className="text-slate-400">Loading…</p>
  }
  if (session === null) {
    return <p className="text-slate-400">This session no longer exists.</p>
  }

  if (session.phase === 'lobby') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-2xl">You're in, <span className="font-semibold">{participant.nickname}</span> 🎉</p>
        <p className="text-slate-400">Waiting for the host to start the quiz…</p>
      </div>
    )
  }

  if (session.phase === 'answering' && questions) {
    const question = questions[session.currentQuestionIndex]
    if (answer) {
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-2xl">Locked in: <span className="font-semibold">{answer.guessedYear}</span></p>
          <p className="text-slate-400">Waiting for the other players…</p>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-lg text-slate-300">{question.prompt}</p>
        <YearPicker onPick={(year) => void handlePick(year)} />
        {submitting && <p className="text-sm text-slate-500">Locking in…</p>}
      </div>
    )
  }

  if (session.phase === 'standings' && questions) {
    if (revealQuestionIndex === session.currentQuestionIndex) {
      return <PersonalReveal answer={answer} question={questions[session.currentQuestionIndex]} />
    }
    return <LookAtScreen message="Standings are up on the big screen!" totalScore={participant.totalScore} />
  }

  if (session.phase === 'podium') {
    return <LookAtScreen message="The final results are on the big screen! 🏆" totalScore={participant.totalScore} />
  }

  if (session.phase === 'ended') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-2xl font-semibold">Thanks for playing, {participant.nickname}!</p>
        <p className="text-slate-400">Your final score: {participant.totalScore} points</p>
      </div>
    )
  }

  return <p className="text-slate-400">Loading…</p>
}

function PersonalReveal({ answer, question }: { answer: Answer | null; question: Question }) {
  const answered = answer !== null
  const scored = answer?.pointsEarned !== null && answer?.pointsEarned !== undefined

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2 text-center"
    >
      <p className="text-slate-400">The correct year was</p>
      <p className="text-5xl font-bold">{question.correctYear}</p>

      {!answered && <p className="mt-2 text-lg text-amber-300">You didn't answer in time — 0 points</p>}

      {answered && !scored && <p className="mt-2 text-slate-400">Scoring your answer…</p>}

      {answered && scored && (
        <>
          <p className="mt-2 text-lg">
            You guessed <span className="font-semibold">{answer.guessedYear}</span>
          </p>
          <p className="text-3xl font-bold text-indigo-400">+{answer.pointsEarned} points</p>
        </>
      )}
    </motion.div>
  )
}

function LookAtScreen({ message, totalScore }: { message: string; totalScore: number }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-2xl">📺</p>
      <p className="text-lg text-slate-300">{message}</p>
      <p className="text-slate-400">Your score so far: <span className="font-semibold text-slate-200">{totalScore}</span></p>
    </div>
  )
}
