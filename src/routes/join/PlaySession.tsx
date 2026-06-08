import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { subscribeToSession } from '../../lib/sessions'
import { subscribeToParticipant } from '../../lib/participants'
import { subscribeToAnswer, submitAnswer } from '../../lib/answers'
import { getQuiz } from '../../lib/quizzes'
import { getQuestion } from '../../lib/questions'
import { STRINGS, type Strings } from '../../lib/strings'
import { YearPicker } from './YearPicker'
import type { Answer, Participant, Question, Session } from '../../types'

const REVEAL_DURATION_MS = 3500

export function PlaySession({ sessionId, uid }: { sessionId: string; uid: string }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [participant, setParticipant] = useState<Participant | null>(null)
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
      if (q) setQuestions(await Promise.all(q.questionIds.map((id) => getQuestion(id))).then((qs) => qs.filter((x): x is Question => x !== null)))
    })
  }, [session?.quizId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track our own answer to the question currently in play.
  useEffect(() => {
    if (!session || (session.phase !== 'answering' && session.phase !== 'results' && session.phase !== 'standings')) {
      setAnswer(null)
      return
    }
    return subscribeToAnswer(sessionId, uid, session.currentQuestionIndex, setAnswer)
  }, [sessionId, uid, session?.phase, session?.currentQuestionIndex])

  // Personal reveal: a transient, local moment shown once when the host moves to the results
  // screen for a question we just played — independent of the synced session phase (see CLAUDE.md).
  useEffect(() => {
    if (!session || session.phase !== 'results') return
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

  const strings = STRINGS[session?.language ?? 'en']
  const s = strings.play

  if (session === undefined || !participant) {
    return <p className="text-slate-400">{s.loading}</p>
  }
  if (session === null) {
    return <p className="text-slate-400">{s.sessionGone}</p>
  }

  if (session.phase === 'lobby') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-2xl">{s.youreIn(participant.nickname)}</p>
        <p className="text-slate-400">{s.waitingForHost}</p>
      </div>
    )
  }

  if (session.phase === 'preview') {
    return <LookAtScreen message={s.getReady} totalScore={participant.totalScore} strings={strings} />
  }

  if (session.phase === 'answering' && questions) {
    const question = questions[session.currentQuestionIndex]
    if (answer) {
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-2xl">{s.lockedIn(answer.guessedYear)}</p>
          <p className="text-slate-400">{s.waitingForOthers}</p>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-lg text-slate-300">{question.prompt}</p>
        <YearPicker onPick={(year) => void handlePick(year)} strings={strings} />
        {submitting && <p className="text-sm text-slate-500">{s.lockingIn}</p>}
      </div>
    )
  }

  if (session.phase === 'results' && questions) {
    if (revealQuestionIndex === session.currentQuestionIndex) {
      return <PersonalReveal answer={answer} question={questions[session.currentQuestionIndex]} strings={strings} />
    }
    return <LookAtScreen message={s.resultsUp} totalScore={participant.totalScore} strings={strings} />
  }

  if (session.phase === 'standings') {
    return <LookAtScreen message={s.standingsUp} totalScore={participant.totalScore} strings={strings} />
  }

  if (session.phase === 'podium') {
    return <LookAtScreen message={s.finalResultsUp} totalScore={participant.totalScore} strings={strings} />
  }

  if (session.phase === 'ended') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-2xl font-semibold">{s.thanksForPlaying(participant.nickname)}</p>
        <p className="text-slate-400">{s.finalScore(participant.totalScore)}</p>
      </div>
    )
  }

  return <p className="text-slate-400">{s.loading}</p>
}

function PersonalReveal({ answer, question, strings }: { answer: Answer | null; question: Question; strings: Strings }) {
  const answered = answer !== null
  const scored = answer?.pointsEarned !== null && answer?.pointsEarned !== undefined
  const s = strings.play

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2 text-center"
    >
      <p className="text-slate-400">{s.correctYearWas}</p>
      <p className="text-5xl font-bold">{question.correctYear}</p>

      {!answered && <p className="mt-2 text-lg text-amber-300">{s.noAnswerInTime}</p>}

      {answered && !scored && <p className="mt-2 text-slate-400">{s.scoringYourAnswer}</p>}

      {answered && scored && (
        <>
          <p className="mt-2 text-lg">
            {s.youGuessed(answer.guessedYear)}
          </p>
          <p className="text-3xl font-bold text-indigo-400">{s.pointsEarned(answer.pointsEarned!)}</p>
        </>
      )}
    </motion.div>
  )
}

function LookAtScreen({ message, totalScore, strings }: { message: string; totalScore: number; strings: Strings }) {
  const s = strings.play
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-2xl">📺</p>
      <p className="text-lg text-slate-300">{message}</p>
      <p className="text-slate-400">{s.scoreSoFar(totalScore)}</p>
    </div>
  )
}
