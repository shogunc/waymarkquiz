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
  tutorial: {
    // Navigation
    next: string
    startQuiz: string
    // Page 1 — the format
    page1Heading: string
    page1Body: string
    exampleTrivia: string
    examplePrompt: string
    // Page 2 — scoring
    page2Heading: string
    page2Body: string
    correctYear: string
    pts: string
    scoringAnnotation: (diff: number) => string
    // Page 3 — drill-down
    page3Heading: string
    page3Body: string
    stepLabel: (n: number) => string
    stepCenturyLabel: string
    stepDecadeLabel: string
    stepYearLabel: string
    tapLocks: string
    // Participant view
    participantHeading: string
    participantStep1: string
    participantStep2: string
    participantStep3: string
    tryItOut: string
    youPicked: (year: number) => string
    tryAgain: string
  }
  lobby: {
    joinAt: string
    waitingForPlayers: string
    playersJoined: (n: number) => string
    starting: string
    startQuiz: string
  }
  preview: {
    revealQuestion: string
  }
  answering: {
    questionXOfY: (current: number, total: number) => string
    secondsLeft: string
    xOfYAnswered: (answered: number, total: number) => string
  }
  results: {
    title: string
    correctYearWas: string
    closestGuesses: string
    pts: string
    continue: string
    continueFinal: string
  }
  standings: {
    title: string
    loading: string
    nextQuestion: string
    showFinalResults: string
  }
  podium: {
    title: string
    /** 0-indexed place (0 = 1st, 1 = 2nd, …). */
    placeLabel: (place: number) => string
    pts: string
    honorableMentions: string
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
    leaveSession: string
    joinNewGame: string
    lockedIn: (year: number) => string
    waitingForOthers: string
    lockingIn: string
    getReady: string
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
  tutorial: {
    next: 'Next',
    startQuiz: 'Start quiz',
    page1Heading: 'Every answer is a year',
    page1Body: 'Each question shows a piece of trivia about something historical. Your job is to guess the exact year it happened, was built, released, or born.',
    exampleTrivia: 'This iron lattice tower was erected as the centrepiece of the 1889 World\'s Fair in Paris. At the time, it was the tallest man-made structure in the world.',
    examplePrompt: 'In what year was the Eiffel Tower completed?',
    page2Heading: 'Closer guess = more points',
    page2Body: 'A perfect answer scores 10 points. Every year off costs 1 point. Ten or more years off scores 0.',
    correctYear: 'Correct answer',
    pts: 'pts',
    scoringAnnotation: (diff) => diff === 0 ? 'perfect!' : `${diff} year${diff === 1 ? '' : 's'} off`,
    page3Heading: 'Pick your year in three taps',
    page3Body: 'On your phone, you drill down to your answer in three steps. Your last tap locks it in immediately — no confirm, no going back.',
    stepLabel: (n) => `Step ${n}`,
    stepCenturyLabel: 'Pick the century',
    stepDecadeLabel: 'Pick the decade',
    stepYearLabel: 'Pick the exact year',
    tapLocks: 'Your last tap locks in immediately — no going back!',
    participantHeading: 'How to play',
    participantStep1: '1. Every question has a year as the answer.',
    participantStep2: '2. Closer = more points. Exact = 10 pts, off by 10+ = 0 pts.',
    participantStep3: '3. Pick your answer in three steps below. Your last tap locks it in.',
    tryItOut: 'Try the picker — pick any year!',
    youPicked: (year) => `You picked ${year}!`,
    tryAgain: 'Try again',
  },
  lobby: {
    joinAt: 'Join at',
    waitingForPlayers: 'Waiting for players…',
    playersJoined: (n) => `${n} player${n === 1 ? '' : 's'} joined`,
    starting: 'Starting…',
    startQuiz: 'Start quiz',
  },
  preview: {
    revealQuestion: 'Reveal question',
  },
  answering: {
    questionXOfY: (current, total) => `Question ${current} of ${total}`,
    secondsLeft: 'seconds left',
    xOfYAnswered: (answered, total) => `${answered} of ${total} answered`,
  },
  results: {
    title: 'Correct answer',
    correctYearWas: 'The correct year was',
    closestGuesses: 'Closest guesses',
    pts: 'pts',
    continue: 'Continue to standings',
    continueFinal: 'Continue to final results',
  },
  standings: {
    title: 'Standings',
    loading: 'Loading…',
    nextQuestion: 'Next question',
    showFinalResults: 'Show final results',
  },
  podium: {
    title: '🏆 Final results',
    placeLabel: (place) => { const n = place + 1; const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'; return `${n}${s}` },
    pts: 'pts',
    honorableMentions: 'Just missed the podium',
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
    leaveSession: 'Leave',
    joinNewGame: 'Join a new game',
    lockedIn: (year) => `Locked in: ${year}`,
    waitingForOthers: 'Waiting for the other players…',
    lockingIn: 'Locking in…',
    getReady: 'Get ready — the next question is coming up!',
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
  tutorial: {
    next: 'Nästa',
    startQuiz: 'Starta quiz',
    page1Heading: 'Varje svar är ett år',
    page1Body: 'Varje fråga visar ett stycke fakta om något historiskt. Din uppgift är att gissa exakt vilket år det hände, byggdes, lanserades eller föddes.',
    exampleTrivia: 'Det här järngittret byggdes som centrum för världsutställningen i Paris 1889. Det var vid den tidpunkten världens högsta byggnad.',
    examplePrompt: 'Vilket år stod Eiffeltornet klart?',
    page2Heading: 'Närmre gissning = fler poäng',
    page2Body: 'Ett perfekt svar ger 10 poäng. Varje år du missar med kostar 1 poäng. Tio eller fler år fel ger 0 poäng.',
    correctYear: 'Rätt svar',
    pts: 'p',
    scoringAnnotation: (diff) => diff === 0 ? 'perfekt!' : `${diff} år ifrån`,
    page3Heading: 'Välj år i tre steg',
    page3Body: 'På din telefon väljer du svaret i tre steg. Sista trycket låser svaret direkt — ingen bekräftelse, ingen återvändo.',
    stepLabel: (n) => `Steg ${n}`,
    stepCenturyLabel: 'Välj sekel',
    stepDecadeLabel: 'Välj decennium',
    stepYearLabel: 'Välj exakt år',
    tapLocks: 'Sista trycket låser svaret direkt — ingen återvändo!',
    participantHeading: 'Hur man spelar',
    participantStep1: '1. Varje fråga har ett år som svar.',
    participantStep2: '2. Närmre = fler poäng. Exakt = 10 p, 10+ år fel = 0 p.',
    participantStep3: '3. Välj svar i tre steg nedan. Sista trycket låser svaret.',
    tryItOut: 'Prova väljaren — välj valfritt år!',
    youPicked: (year) => `Du valde ${year}!`,
    tryAgain: 'Prova igen',
  },
  lobby: {
    joinAt: 'Anslut på',
    waitingForPlayers: 'Väntar på spelare…',
    playersJoined: (n) => `${n} spelare har anslutit`,
    starting: 'Startar…',
    startQuiz: 'Starta quiz',
  },
  preview: {
    revealQuestion: 'Visa frågan',
  },
  answering: {
    questionXOfY: (current, total) => `Fråga ${current} av ${total}`,
    secondsLeft: 'sekunder kvar',
    xOfYAnswered: (answered, total) => `${answered} av ${total} har svarat`,
  },
  results: {
    title: 'Rätt svar',
    correctYearWas: 'Rätt årtal var',
    closestGuesses: 'Närmast gissat',
    pts: 'p',
    continue: 'Fortsätt till ställningen',
    continueFinal: 'Fortsätt till slutresultat',
  },
  standings: {
    title: 'Ställning',
    loading: 'Laddar…',
    nextQuestion: 'Nästa fråga',
    showFinalResults: 'Visa slutresultat',
  },
  podium: {
    title: '🏆 Slutresultat',
    placeLabel: (place) => `${place + 1}:a`,
    pts: 'p',
    honorableMentions: 'Nästan på pallen',
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
    leaveSession: 'Lämna',
    joinNewGame: 'Gå med i ett nytt spel',
    lockedIn: (year) => `Låst: ${year}`,
    waitingForOthers: 'Väntar på de andra spelarna…',
    lockingIn: 'Låser…',
    getReady: 'Gör dig redo — nästa fråga är på väg!',
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
