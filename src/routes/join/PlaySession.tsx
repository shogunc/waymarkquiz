import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { subscribeToSession } from '../../lib/sessions'
import { subscribeToParticipant, leaveSession } from '../../lib/participants'
import { subscribeToAnswer, submitAnswer } from '../../lib/answers'
import { getQuiz } from '../../lib/quizzes'
import { getQuestion } from '../../lib/questions'
import { STRINGS, type Strings } from '../../lib/strings'
import { YearPicker } from './YearPicker'
import type { Answer, Participant, Question, Session } from '../../types'

export function PlaySession({ sessionId, uid, onLeave }: { sessionId: string; uid: string; onLeave: () => void }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [leaving, setLeaving] = useState(false)

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

  async function handlePick(year: number) {
    if (!session) return
    setSubmitting(true)
    try {
      await submitAnswer(sessionId, uid, session.currentQuestionIndex, year)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLeave() {
    setLeaving(true)
    try {
      await leaveSession(sessionId, uid)
      onLeave()
    } finally {
      setLeaving(false)
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
        <button
          onClick={() => void handleLeave()}
          disabled={leaving}
          className="mt-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 disabled:opacity-50"
        >
          {s.leaveSession}
        </button>
      </div>
    )
  }

  if (session.phase === 'tutorial') {
    return <TutorialParticipant strings={strings} />
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
        <p className="text-center text-lg text-slate-300">{question.prompt[session.language]}</p>
        <YearPicker onPick={(year) => void handlePick(year)} strings={strings} />
        {submitting && <p className="text-sm text-slate-500">{s.lockingIn}</p>}
      </div>
    )
  }

  if (session.phase === 'results' && questions) {
    return <PersonalReveal answer={answer} question={questions[session.currentQuestionIndex]} strings={strings} />
  }

  if (session.phase === 'standings') {
    return <LookAtScreen message={s.standingsUp} totalScore={participant.totalScore} strings={strings} />
  }

  if (session.phase === 'podium') {
    return <LookAtScreen message={s.finalResultsUp} totalScore={participant.totalScore} final strings={strings} />
  }

  if (session.phase === 'ended') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-2xl font-semibold">{s.thanksForPlaying(participant.nickname)}</p>
        <p className="text-slate-400">{s.finalScore(participant.totalScore)}</p>
        <button
          onClick={onLeave}
          className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          {s.joinNewGame}
        </button>
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

function TutorialParticipant({ strings }: { strings: Strings }) {
  const s = strings.tutorial
  const [pickedYear, setPickedYear] = useState<number | null>(null)
  const [key, setKey] = useState(0)

  function handlePick(year: number) {
    setPickedYear(year)
  }

  function handleReset() {
    setPickedYear(null)
    setKey((k) => k + 1)
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <p className="text-xl font-semibold">{s.participantHeading}</p>
        <p className="text-sm text-slate-400">{s.participantStep1}</p>
        <p className="text-sm text-slate-400">{s.participantStep2}</p>
        <p className="text-sm text-slate-400">{s.participantStep3}</p>
      </div>

      {pickedYear === null ? (
        <>
          <p className="text-center text-slate-500 text-sm">{s.tryItOut}</p>
          <YearPicker key={key} onPick={handlePick} strings={strings} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="text-3xl font-bold text-indigo-400">{s.youPicked(pickedYear)}</p>
          <button
            onClick={handleReset}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            {s.tryAgain}
          </button>
        </div>
      )}
    </div>
  )
}

function LookAtScreen({ message, totalScore, final: isFinal = false, strings }: { message: string; totalScore: number; final?: boolean; strings: Strings }) {
  const s = strings.play
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-2xl">📺</p>
      <p className="text-lg text-slate-300">{message}</p>
      <p className="text-slate-400">{isFinal ? s.finalScore(totalScore) : s.scoreSoFar(totalScore)}</p>
    </div>
  )
}
