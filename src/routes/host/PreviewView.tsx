import type { Question } from '../../types'
import type { Strings } from '../../lib/strings'

export function PreviewView({
  question,
  questionNumber,
  totalQuestions,
  onReveal,
  revealing,
  strings,
}: {
  question: Question
  questionNumber: number
  totalQuestions: number
  onReveal: () => void
  revealing: boolean
  strings: Strings
}) {
  const s = strings.preview

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
      <p className="text-slate-400">{s.questionXOfY(questionNumber, totalQuestions)}</p>

      <p className="max-w-2xl text-2xl text-slate-200">{question.trivia}</p>

      <p className="text-sm text-slate-500">{s.readTrivia}</p>

      <button
        onClick={onReveal}
        disabled={revealing}
        className="rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold hover:bg-indigo-500 disabled:opacity-40"
      >
        {s.revealQuestion}
      </button>
    </div>
  )
}
