import { useState } from 'react'
import type { Strings } from '../../lib/strings'
import type { Language, Question } from '../../types'

const FALLBACK_YEAR = 1889

function scoringRows(correctYear: number) {
  return [
    { guess: correctYear,      points: 10 },
    { guess: correctYear + 3,  points: 7  },
    { guess: correctYear + 16, points: 0  },
  ]
}

// Simplified Eiffel Tower silhouette against a dusk sky.
function EiffelSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 240" className={className} aria-hidden>
      <defs>
        <linearGradient id="tutSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1b2e" />
          <stop offset="70%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#3a6186" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="400" height="240" fill="url(#tutSky)" />
      {/* Stars */}
      <circle cx="48"  cy="28"  r="1.5" fill="white" fillOpacity="0.7" />
      <circle cx="120" cy="18"  r="1"   fill="white" fillOpacity="0.5" />
      <circle cx="310" cy="22"  r="1.5" fill="white" fillOpacity="0.6" />
      <circle cx="355" cy="48"  r="1"   fill="white" fillOpacity="0.5" />
      <circle cx="75"  cy="65"  r="1"   fill="white" fillOpacity="0.4" />
      <circle cx="260" cy="40"  r="1"   fill="white" fillOpacity="0.5" />
      {/* Ground */}
      <rect y="222" width="400" height="18" fill="#1e3d0e" />
      {/* Bushes/trees for depth */}
      <ellipse cx="68"  cy="222" rx="52" ry="14" fill="#162d0a" />
      <ellipse cx="332" cy="222" rx="52" ry="14" fill="#162d0a" />
      {/* Tower — all dark silhouette */}
      {/* Left leg */}
      <polygon points="132,220 160,220 179,180 173,180" fill="#0f0f1a" />
      {/* Right leg */}
      <polygon points="240,220 268,220 227,180 221,180" fill="#0f0f1a" />
      {/* Cross brace lower */}
      <rect x="160" y="205" width="80" height="7"  fill="#0f0f1a" />
      {/* Cross brace upper */}
      <rect x="166" y="191" width="68" height="6"  fill="#0f0f1a" />
      {/* First floor platform */}
      <rect x="170" y="177" width="60" height="8"  fill="#0f0f1a" />
      {/* Middle body */}
      <polygon points="170,176 230,176 217,120 183,120" fill="#0f0f1a" />
      {/* Second floor platform */}
      <rect x="179" y="116" width="42" height="8"  fill="#0f0f1a" />
      {/* Upper body */}
      <polygon points="180,115 220,115 210,60 190,60" fill="#0f0f1a" />
      {/* Third platform */}
      <rect x="187" y="56" width="26" height="7"   fill="#0f0f1a" />
      {/* Spire */}
      <polygon points="188,55 212,55 203,28 197,28" fill="#0f0f1a" />
      {/* Antenna */}
      <polygon points="197,28 203,28 201,10 199,10" fill="#0f0f1a" />
      {/* Warm lights on platforms */}
      <circle cx="200" cy="57"  r="2.5" fill="#ffd060" fillOpacity="0.9" />
      <circle cx="200" cy="117" r="2.5" fill="#ffd060" fillOpacity="0.8" />
      <circle cx="200" cy="178" r="2"   fill="#ffd060" fillOpacity="0.7" />
    </svg>
  )
}

function PageDots({ page, total }: { page: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${i + 1 === page ? 'w-6 bg-indigo-400' : 'w-2 bg-slate-700'}`}
        />
      ))}
    </div>
  )
}

function NavRow({ page, total, onPrev, onNext, onStart, starting, s }: {
  page: number; total: number
  onPrev: () => void; onNext: () => void; onStart: () => void
  starting: boolean
  s: Strings['tutorial']
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="rounded-lg border border-slate-700 px-5 py-2.5 font-medium hover:bg-slate-800 disabled:invisible"
      >
        ← Back
      </button>
      <PageDots page={page} total={total} />
      {page < total ? (
        <button onClick={onNext} className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium hover:bg-indigo-500">
          {s.next} →
        </button>
      ) : (
        <button
          onClick={onStart}
          disabled={starting}
          className="rounded-xl bg-indigo-600 px-8 py-2.5 font-semibold hover:bg-indigo-500 disabled:opacity-50"
        >
          {starting ? '…' : s.startQuiz}
        </button>
      )}
    </div>
  )
}

export function TutorialView({ onStart, starting, strings, language, exampleQuestion }: {
  onStart: () => void
  starting: boolean
  strings: Strings
  language: Language
  exampleQuestion: Question | null
}) {
  const [page, setPage] = useState(1)
  const TOTAL = 3
  const s = strings.tutorial

  const correctYear = exampleQuestion?.correctYear ?? FALLBACK_YEAR
  const rows = scoringRows(correctYear)
  const prompt = exampleQuestion
    ? (exampleQuestion.prompt[language] ?? Object.values(exampleQuestion.prompt)[0] ?? '')
    : s.examplePrompt

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">

      {/* Page 1 — every answer is a year */}
      {page === 1 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">{s.page1Heading}</h1>
            <p className="mt-2 text-lg text-slate-400">{s.page1Body}</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
            {exampleQuestion
              ? <img src={exampleQuestion.imageData} alt="" className="aspect-video w-full object-cover" />
              : <EiffelSvg className="w-full" />}
            <div className="p-6">
              <p className="text-2xl font-semibold">{prompt}</p>
            </div>
          </div>
        </div>
      )}

      {/* Page 2 — scoring */}
      {page === 2 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">{s.page2Heading}</h1>
            <p className="mt-2 text-lg text-slate-400">{s.page2Body}</p>
          </div>
          <div className="flex flex-col gap-6 rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex items-center gap-6">
              {exampleQuestion
                ? <img src={exampleQuestion.imageData} alt="" className="h-24 w-40 flex-shrink-0 rounded-xl object-cover" />
                : <EiffelSvg className="w-40 flex-shrink-0 rounded-xl" />}
              <div>
                <p className="text-sm text-slate-400">{s.correctYear}</p>
                <p className="text-6xl font-bold">{correctYear}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {rows.map(({ guess, points }) => {
                const diff = Math.abs(guess - correctYear)
                const color = points === 10 ? 'bg-green-500' : points > 0 ? 'bg-yellow-500' : ''
                const textColor = points === 10 ? 'text-green-400' : points > 0 ? 'text-yellow-400' : 'text-slate-500'
                return (
                  <div key={guess} className="flex items-center gap-4">
                    <span className="w-16 text-right font-mono text-slate-300">{guess}</span>
                    <div className="h-7 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${points * 10}%` }} />
                    </div>
                    <span className={`w-14 text-right font-semibold tabular-nums ${textColor}`}>{points} {s.pts}</span>
                    <span className="w-24 text-sm text-slate-500">{s.scoringAnnotation(diff)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Page 3 — drill-down picker */}
      {page === 3 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">{s.page3Heading}</h1>
            <p className="mt-2 text-lg text-slate-400">{s.page3Body}</p>
          </div>
          <div className="flex items-stretch gap-3">
            <PickerStep stepLabel={s.stepLabel(1)} heading={s.stepCenturyLabel} buttons={['1900s', '2000s']} cols={2} highlightIndex={0} />
            <StepArrow />
            <PickerStep stepLabel={s.stepLabel(2)} heading={s.stepDecadeLabel} buttons={['70s', '80s', '90s']} cols={3} highlightIndex={1} />
            <StepArrow />
            <PickerStep stepLabel={s.stepLabel(3)} heading={s.stepYearLabel} buttons={['1887', '1888', '1889']} cols={3} highlightIndex={2} locked />
          </div>
          <p className="text-center text-slate-300">{s.tapLocks}</p>
        </div>
      )}

      <NavRow
        page={page} total={TOTAL}
        onPrev={() => setPage(p => p - 1)}
        onNext={() => setPage(p => p + 1)}
        onStart={onStart} starting={starting}
        s={s}
      />
    </div>
  )
}

function StepArrow() {
  return <div className="flex flex-shrink-0 items-center pt-10 text-2xl text-slate-600">→</div>
}

function PickerStep({ stepLabel, heading, buttons, cols, highlightIndex, locked = false }: {
  stepLabel: string; heading: string
  buttons: string[]; cols: number
  highlightIndex: number; locked?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <div>
        <span className="rounded-full bg-indigo-700 px-2.5 py-0.5 text-xs font-bold">{stepLabel}</span>
        <p className="mt-1.5 text-xs text-slate-400">{heading}</p>
      </div>
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {buttons.map((label, i) => {
          const isSelected = i === highlightIndex
          return (
            <div
              key={label}
              className={`rounded-xl px-2 py-4 text-center text-sm font-semibold ${
                isSelected
                  ? locked
                    ? 'bg-indigo-500 ring-2 ring-indigo-300'
                    : 'bg-indigo-600'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {label}
              {isSelected && locked && <div className="mt-0.5 text-xs opacity-80">✓ locked</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
