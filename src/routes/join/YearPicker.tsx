import { useState } from 'react'
import type { Strings } from '../../lib/strings'

// The selectable range is fixed across all quizzes (see CLAUDE.md "Answering a
// question") so the drill-down structure never has to vary per quiz/question.
// Bump MAX_YEAR as years pass.
const MIN_YEAR = 1900
const MAX_YEAR = 2026

function range(start: number, end: number, step: number): number[] {
  const values: number[] = []
  for (let v = start; v <= end; v += step) values.push(v)
  return values
}

const CENTURIES = range(Math.floor(MIN_YEAR / 100) * 100, MAX_YEAR, 100)

function decadesIn(century: number): number[] {
  return range(century, Math.min(century + 90, MAX_YEAR), 10)
}

function yearsIn(decade: number): number[] {
  return range(decade, Math.min(decade + 9, MAX_YEAR), 1)
}

type Step = { kind: 'century' } | { kind: 'decade'; century: number } | { kind: 'year'; century: number; decade: number }

const gridButton =
  'rounded-2xl bg-slate-800 px-4 py-6 text-2xl font-semibold hover:bg-slate-700 active:bg-indigo-600 transition-colors'

export function YearPicker({ onPick, strings }: { onPick: (year: number) => void; strings: Strings }) {
  const [step, setStep] = useState<Step>({ kind: 'century' })
  const s = strings.yearPicker

  function back() {
    if (step.kind === 'decade') setStep({ kind: 'century' })
    else if (step.kind === 'year') setStep({ kind: 'decade', century: step.century })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center gap-3">
        {step.kind !== 'century' && (
          <button onClick={back} className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">
            {s.back}
          </button>
        )}
        <p className="text-slate-400">
          {step.kind === 'century' && s.pickCentury}
          {step.kind === 'decade' && s.pickDecadeIn(step.century)}
          {step.kind === 'year' && s.pickYearIn(s.decadeLabel(step.decade))}
        </p>
      </div>

      {step.kind === 'century' && (
        <div className="grid grid-cols-2 gap-3">
          {CENTURIES.map((century) => (
            <button key={century} className={gridButton} onClick={() => setStep({ kind: 'decade', century })}>
              {s.centuryLabel(century)}
            </button>
          ))}
        </div>
      )}

      {step.kind === 'decade' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {decadesIn(step.century).map((decade) => (
            <button key={decade} className={gridButton} onClick={() => setStep({ kind: 'year', century: step.century, decade })}>
              {s.decadeLabel(decade)}
            </button>
          ))}
        </div>
      )}

      {step.kind === 'year' && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {yearsIn(step.decade).map((year) => (
            <button key={year} className={gridButton} onClick={() => onPick(year)}>
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
