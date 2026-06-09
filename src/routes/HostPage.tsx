import { useEffect, useRef, useState } from 'react'
import { ensureSignedIn } from '../lib/auth'
import { createSession, patchSession, subscribeToSession } from '../lib/sessions'
import { subscribeToParticipants, setParticipantScore } from '../lib/participants'
import { subscribeToAnswersForQuestion, scoreAnswer } from '../lib/answers'
import { getQuiz } from '../lib/quizzes'
import { getQuestion } from '../lib/questions'
import { scoreGuess } from '../lib/scoring'
import { STRINGS } from '../lib/strings'
import { QuizPicker } from './host/QuizPicker'
import { LobbyView } from './host/LobbyView'
import { QuestionView } from './host/QuestionView'
import { ResultsView } from './host/ResultsView'
import { StandingsView } from './host/StandingsView'
import { PodiumView } from './host/PodiumView'
import type { Answer, Language, Participant, Question, Quiz, Session } from '../types'

export function HostPage() {
  const [hostUid, setHostUid] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [creating, setCreating] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scoredQuestionIndex = useRef<number | null>(null)

  const fakeScores = useRef<Record<string, number>>({})
  const fakeAnswersCache = useRef<Record<number, Answer[]>>({})

  useEffect(() => {
    void ensureSignedIn().then((user) => setHostUid(user.uid))
  }, [])

  // Once a session exists, subscribe to it and load its quiz + questions.
  useEffect(() => {
    if (!session) return
    void getQuiz(session.quizId).then(async (q) => {
      setQuiz(q)
      if (q) setQuestions(await Promise.all(q.questionIds.map((id) => getQuestion(id))).then((qs) => qs.filter((x): x is Question => x !== null)))
    })
    return subscribeToSession(session.id, (updated) => setSession(updated))
  }, [session?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!session) return
    return subscribeToParticipants(session.id, setParticipants)
  }, [session?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track answers for whichever question is currently live or just closed — results and
  // standings both still need this question's per-participant points (results to show the
  // closest guesses, standings to roll scores back to their pre-round values for the reveal).
  useEffect(() => {
    if (!session || (session.phase !== 'answering' && session.phase !== 'results' && session.phase !== 'standings')) {
      setAnswers([])
      return
    }
    return subscribeToAnswersForQuestion(session.id, session.currentQuestionIndex, setAnswers)
  }, [session?.id, session?.phase, session?.currentQuestionIndex])

  // Score this question's answers exactly once — either when everyone has answered, or when the
  // answer window closes, whichever comes first — then move on to the results screen.
  useEffect(() => {
    if (!session || !quiz || !questions) return
    if (session.phase !== 'answering' || session.answerWindowEndsAt === null) return
    if (scoredQuestionIndex.current === session.currentQuestionIndex) return

    const questionIndex = session.currentQuestionIndex
    const question = questions[questionIndex]
    const activeSession = session

    function trigger() {
      if (scoredQuestionIndex.current === questionIndex) return
      scoredQuestionIndex.current = questionIndex
      void scoreCurrentQuestion(activeSession, question, questionIndex)
    }

    if (participants.length > 0 && answers.length >= participants.length) {
      trigger()
      return
    }

    const msRemaining = session.answerWindowEndsAt - Date.now()
    const id = setTimeout(trigger, Math.max(0, msRemaining))
    return () => clearTimeout(id)
  }, [session, quiz, questions, answers, participants]) // eslint-disable-line react-hooks/exhaustive-deps

  async function scoreCurrentQuestion(activeSession: Session, question: Question, questionIndex: number) {
    setTransitioning(true)
    try {
      const answersSnap = await new Promise<Answer[]>((resolve) => {
        const unsubscribe = subscribeToAnswersForQuestion(activeSession.id, questionIndex, (a) => {
          unsubscribe()
          resolve(a)
        })
      })

      for (const participant of participants) {
        const answer = answersSnap.find((a) => a.participantId === participant.id)
        if (!answer || answer.pointsEarned !== null) continue
        const points = scoreGuess(question.correctYear, answer.guessedYear)
        await scoreAnswer(activeSession.id, participant.id, questionIndex, points)
        await setParticipantScore(activeSession.id, participant.id, participant.totalScore + points)
      }

      await patchSession(activeSession.id, { phase: 'results', answerWindowEndsAt: null })
    } catch (e) {
      setError(String(e))
    } finally {
      setTransitioning(false)
    }
  }

  async function handlePickQuiz(picked: Quiz, language: Language, answerDurationSeconds: number) {
    if (!hostUid) return
    setCreating(true)
    setError(null)
    try {
      const created = await createSession(picked.id, hostUid, language, answerDurationSeconds)
      setQuiz(picked)
      setSession(created)
    } catch (e) {
      setError(String(e))
    } finally {
      setCreating(false)
    }
  }

  async function handleStart() {
    if (!session || !quiz) return
    setTransitioning(true)
    try {
      await patchSession(session.id, {
        phase: 'preview',
        currentQuestionIndex: 0,
        answerWindowEndsAt: null,
      })
    } finally {
      setTransitioning(false)
    }
  }

  async function handleReveal() {
    if (!session) return
    setTransitioning(true)
    try {
      await patchSession(session.id, {
        phase: 'answering',
        answerWindowEndsAt: Date.now() + session.answerDurationSeconds * 1000,
      })
    } finally {
      setTransitioning(false)
    }
  }

  async function handleShowStandings() {
    if (!session || !questions) return
    const isLast = session.currentQuestionIndex >= questions.length - 1
    await patchSession(session.id, { phase: isLast ? 'podium' : 'standings', answerWindowEndsAt: null })
  }

  async function handleNext() {
    if (!session || !quiz || !questions) return
    setTransitioning(true)
    try {
      const nextIndex = session.currentQuestionIndex + 1
      if (nextIndex < questions.length) {
        scoredQuestionIndex.current = null
        await patchSession(session.id, {
          phase: 'preview',
          currentQuestionIndex: nextIndex,
          answerWindowEndsAt: null,
        })
      } else {
        await patchSession(session.id, { phase: 'podium', answerWindowEndsAt: null })
      }
    } finally {
      setTransitioning(false)
    }
  }

  async function handleEnd() {
    if (!session) return
    await patchSession(session.id, { phase: 'ended' })
  }

  // ---- DEBUG: simulated crowd — toggle FAKE_CROWD_ENABLED to test standings/results with many participants ----
  const FAKE_CROWD_ENABLED = false
  const FAKE_NAMES = ['Alice','Bob','Charlie','Diana','Erik','Fatima','Gustav','Hannah','Ivan','Julia','Karl','Lena','Marcus','Nina','Oscar','Petra','Ravi','Sara','Thomas','Ulrika']
  const FAKE_CROWD_SIZE = FAKE_NAMES.length
  let fakeAnswers: Answer[] = []
  if (FAKE_CROWD_ENABLED && session && questions) {
    const qIndex = session.currentQuestionIndex
    const question = questions[qIndex]
    if (question) {
      if (!fakeAnswersCache.current[qIndex]) {
        fakeAnswersCache.current[qIndex] = Array.from({ length: FAKE_CROWD_SIZE }, (_, i) => ({
          participantId: `fake-${i}`,
          questionIndex: qIndex,
          guessedYear: Math.min(2026, Math.max(1900, question.correctYear + Math.floor(Math.random() * 41) - 20)),
          submittedAt: Date.now(),
          pointsEarned: null,
        }))
      }
      fakeAnswers = fakeAnswersCache.current[qIndex]
      if (session.phase === 'results' || session.phase === 'standings' || session.phase === 'podium') {
        for (const a of fakeAnswers) {
          if (a.pointsEarned === null) {
            a.pointsEarned = scoreGuess(question.correctYear, a.guessedYear)
            fakeScores.current[a.participantId] = (fakeScores.current[a.participantId] ?? 0) + a.pointsEarned
          }
        }
      }
    }
  }
  const displayParticipants: Participant[] = FAKE_CROWD_ENABLED
    ? Array.from({ length: FAKE_CROWD_SIZE }, (_, i) => {
        const id = `fake-${i}`
        return { id, nickname: FAKE_NAMES[i], joinedAt: 0, totalScore: fakeScores.current[id] ?? 0 }
      })
    : participants

  const displayAnswers = FAKE_CROWD_ENABLED ? fakeAnswers : answers
  // ---- END DEBUG ----

  const strings = STRINGS[session?.language ?? 'en']
  const s = strings.sessionEnded

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-950 p-6 text-slate-100">
      {error && <p className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300">{error}</p>}

      {!session && hostUid && (
        <QuizPicker onPick={(q, language, answerDurationSeconds) => void handlePickQuiz(q, language, answerDurationSeconds)} busy={creating} />
      )}

      {session && quiz && session.phase === 'lobby' && (
        <LobbyView session={session} quiz={quiz} participants={displayParticipants} onStart={() => void handleStart()} starting={transitioning} strings={strings} />
      )}

      {session && questions && (session.phase === 'preview' || session.phase === 'answering') && (
        <QuestionView
          session={session}
          question={questions[session.currentQuestionIndex]}
          questionNumber={session.currentQuestionIndex + 1}
          totalQuestions={questions.length}
          participants={displayParticipants}
          answers={displayAnswers}
          revealed={session.phase === 'answering'}
          onReveal={() => void handleReveal()}
          revealing={transitioning}
          strings={strings}
        />
      )}

      {session && questions && session.phase === 'results' && (
        <ResultsView
          question={questions[session.currentQuestionIndex]}
          participants={displayParticipants}
          answers={displayAnswers}
          onContinue={() => void handleShowStandings()}
          advancing={transitioning}
          strings={strings}
        />
      )}

      {session && questions && session.phase === 'standings' && (
        <StandingsView
          participants={displayParticipants}
          answers={displayAnswers}
          isLastQuestion={session.currentQuestionIndex >= questions.length - 1}
          onNext={() => void handleNext()}
          advancing={transitioning}
          strings={strings}
        />
      )}

      {session && session.phase === 'podium' && <PodiumView participants={displayParticipants} onEnd={() => void handleEnd()} strings={strings} />}

      {session && session.phase === 'ended' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-semibold">{s.title}</h1>
          <p className="text-slate-400">{s.subtitle}</p>
          <button
            onClick={() => {
              setSession(null)
              setQuiz(null)
              setQuestions(null)
              scoredQuestionIndex.current = null
            }}
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium hover:bg-indigo-500"
          >
            {s.startNewSession}
          </button>
        </div>
      )}
    </main>
  )
}
