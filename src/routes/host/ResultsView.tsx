import type { Answer, Participant, Question } from '../../types'
import type { Strings } from '../../lib/strings'

const MAX_CLOSEST_GUESSES = 5

export function ResultsView({
  question,
  participants,
  answers,
  isLastQuestion,
  onContinue,
  advancing,
  strings,
}: {
  question: Question
  participants: Participant[]
  answers: Answer[]
  isLastQuestion: boolean
  onContinue: () => void
  advancing: boolean
  strings: Strings
}) {
  const s = strings.results
  const byId = new Map(participants.map((p) => [p.id, p]))

  const closest = answers
    .filter((a): a is Answer & { pointsEarned: number } => a.pointsEarned !== null && a.pointsEarned > 0)
    .map((a) => ({ answer: a, participant: byId.get(a.participantId) }))
    .filter((x): x is { answer: Answer & { pointsEarned: number }; participant: Participant } => x.participant !== undefined)
    .sort((a, b) => b.answer.pointsEarned - a.answer.pointsEarned)
    .slice(0, MAX_CLOSEST_GUESSES)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
      <h1 className="text-xl font-semibold">{s.title}</h1>

      <img src={question.imageData} alt="" className="max-h-[30vh] rounded-2xl object-contain shadow-2xl" />

      <div className="flex flex-col items-center gap-1">
        <p className="text-slate-400">{s.correctYearWas}</p>
        <p className="text-5xl font-bold tabular-nums">{question.correctYear}</p>
      </div>

      {closest.length > 0 && (
        <div className="w-full">
          <h2 className="mb-3 text-sm font-medium text-slate-400">{s.closestGuesses}</h2>
          <ul className="flex flex-col gap-2">
            {closest.map(({ answer, participant }) => (
              <li
                key={participant.id}
                className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-3"
              >
                <span className="flex-1 text-left font-medium">{participant.nickname}</span>
                <span className="tabular-nums text-slate-400">{answer.guessedYear}</span>
                <span className="text-lg font-bold tabular-nums text-indigo-400">
                  +{answer.pointsEarned} {s.pts}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onContinue}
        disabled={advancing}
        className="rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold hover:bg-indigo-500 disabled:opacity-40"
      >
        {isLastQuestion ? s.continueFinal : s.continue}
      </button>
    </div>
  )
}
