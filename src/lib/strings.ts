// Lightweight i18n: every session-facing string lives here, grouped by the view
// that uses it. The host picks a language when starting a session (see
// QuizPicker); that choice is stored on the session document and every client
// — host screen and participants alike — renders from STRINGS[session.language].
//
// Pre-session screens (HomePage, JoinForm, the quiz picker's own chrome) render
// in English — there's no session yet to carry a language choice.
import type { Language } from '../types'

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'sv', label: 'Svenska' },
]

export interface Strings {
  lobby: {
    joinAt: string
    waitingForPlayers: string
    playersJoined: (n: number) => string
    starting: string
    startQuiz: string
  }
  answering: {
    questionXOfY: (current: number, total: number) => string
    secondsLeft: string
    xOfYAnswered: (answered: number, total: number) => string
  }
  standings: {
    title: string
    loading: string
    nextQuestion: string
    showFinalResults: string
  }
  podium: {
    title: string
    /** 0-indexed place (0 = 1st, 1 = 2nd, 2 = 3rd). */
    placeLabel: (place: number) => string
    pts: string
    endSession: string
  }
  sessionEnded: {
    title: string
    subtitle: string
    startNewSession: string
  }
  play: {
    loading: string
    sessionGone: string
    youreIn: (nickname: string) => string
    waitingForHost: string
    lockedIn: (year: number) => string
    waitingForOthers: string
    lockingIn: string
    standingsUp: string
    finalResultsUp: string
    thanksForPlaying: (nickname: string) => string
    finalScore: (score: number) => string
    scoreSoFar: (score: number) => string
    correctYearWas: string
    noAnswerInTime: string
    scoringYourAnswer: string
    youGuessed: (year: number) => string
    pointsEarned: (points: number) => string
  }
  yearPicker: {
    back: string
    pickCentury: string
    pickDecadeIn: (century: number) => string
    pickYearIn: (decadeLabel: string) => string
    centuryLabel: (century: number) => string
    decadeLabel: (decade: number) => string
  }
}

const en: Strings = {
  lobby: {
    joinAt: 'Join at',
    waitingForPlayers: 'Waiting for players…',
    playersJoined: (n) => `${n} player${n === 1 ? '' : 's'} joined`,
    starting: 'Starting…',
    startQuiz: 'Start quiz',
  },
  answering: {
    questionXOfY: (current, total) => `Question ${current} of ${total}`,
    secondsLeft: 'seconds left',
    xOfYAnswered: (answered, total) => `${answered} of ${total} answered`,
  },
  standings: {
    title: 'Standings',
    loading: 'Loading…',
    nextQuestion: 'Next question',
    showFinalResults: 'Show final results',
  },
  podium: {
    title: '🏆 Final results',
    placeLabel: (place) => ['1st', '2nd', '3rd'][place],
    pts: 'pts',
    endSession: 'End session',
  },
  sessionEnded: {
    title: 'Session ended',
    subtitle: 'Thanks for playing — start a new session to play again.',
    startNewSession: 'Start a new session',
  },
  play: {
    loading: 'Loading…',
    sessionGone: 'This session no longer exists.',
    youreIn: (nickname) => `You're in, ${nickname} 🎉`,
    waitingForHost: 'Waiting for the host to start the quiz…',
    lockedIn: (year) => `Locked in: ${year}`,
    waitingForOthers: 'Waiting for the other players…',
    lockingIn: 'Locking in…',
    standingsUp: 'Standings are up on the big screen!',
    finalResultsUp: 'The final results are on the big screen! 🏆',
    thanksForPlaying: (nickname) => `Thanks for playing, ${nickname}!`,
    finalScore: (score) => `Your final score: ${score} points`,
    scoreSoFar: (score) => `Your score so far: ${score}`,
    correctYearWas: 'The correct year was',
    noAnswerInTime: "You didn't answer in time — 0 points",
    scoringYourAnswer: 'Scoring your answer…',
    youGuessed: (year) => `You guessed ${year}`,
    pointsEarned: (points) => `+${points} points`,
  },
  yearPicker: {
    back: '← Back',
    pickCentury: 'Pick a century',
    pickDecadeIn: (century) => `Pick a decade in the ${century}s`,
    pickYearIn: (decadeLabel) => `Pick the exact year in the ${decadeLabel}`,
    centuryLabel: (century) => `${century}s`,
    decadeLabel: (decade) => `${String(decade % 100).padStart(2, '0')}s`,
  },
}

const sv: Strings = {
  lobby: {
    joinAt: 'Anslut på',
    waitingForPlayers: 'Väntar på spelare…',
    playersJoined: (n) => `${n} spelare har anslutit`,
    starting: 'Startar…',
    startQuiz: 'Starta quiz',
  },
  answering: {
    questionXOfY: (current, total) => `Fråga ${current} av ${total}`,
    secondsLeft: 'sekunder kvar',
    xOfYAnswered: (answered, total) => `${answered} av ${total} har svarat`,
  },
  standings: {
    title: 'Ställning',
    loading: 'Laddar…',
    nextQuestion: 'Nästa fråga',
    showFinalResults: 'Visa slutresultat',
  },
  podium: {
    title: '🏆 Slutresultat',
    placeLabel: (place) => ['1:a', '2:a', '3:a'][place],
    pts: 'p',
    endSession: 'Avsluta',
  },
  sessionEnded: {
    title: 'Sessionen har avslutats',
    subtitle: 'Tack för att ni spelade — starta en ny session för att spela igen.',
    startNewSession: 'Starta en ny session',
  },
  play: {
    loading: 'Laddar…',
    sessionGone: 'Den här sessionen finns inte längre.',
    youreIn: (nickname) => `Du är med, ${nickname} 🎉`,
    waitingForHost: 'Väntar på att värden ska starta quizet…',
    lockedIn: (year) => `Låst: ${year}`,
    waitingForOthers: 'Väntar på de andra spelarna…',
    lockingIn: 'Låser…',
    standingsUp: 'Ställningen visas på storbildsskärmen!',
    finalResultsUp: 'Slutresultatet visas på storbildsskärmen! 🏆',
    thanksForPlaying: (nickname) => `Tack för att du spelade, ${nickname}!`,
    finalScore: (score) => `Ditt slutresultat: ${score} poäng`,
    scoreSoFar: (score) => `Ditt resultat hittills: ${score}`,
    correctYearWas: 'Rätt årtal var',
    noAnswerInTime: 'Du hann inte svara i tid — 0 poäng',
    scoringYourAnswer: 'Räknar ut poäng…',
    youGuessed: (year) => `Du gissade ${year}`,
    pointsEarned: (points) => `+${points} poäng`,
  },
  yearPicker: {
    back: '← Tillbaka',
    pickCentury: 'Välj ett århundrade',
    pickDecadeIn: (century) => `Välj ett decennium på ${century}-talet`,
    pickYearIn: (decadeLabel) => `Välj exakt år på ${decadeLabel}`,
    centuryLabel: (century) => `${century}-tal`,
    decadeLabel: (decade) => `${String(decade % 100).padStart(2, '0')}-tal`,
  },
}

export const STRINGS: Record<Language, Strings> = { en, sv }
