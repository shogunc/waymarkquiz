import type { Language } from '../types'

function FlagSV() {
  return (
    <svg viewBox="0 0 20 12" className="h-3.5 w-6 rounded-sm" aria-hidden>
      <rect width="20" height="12" fill="#006AA7" />
      <rect x="5.5" width="3" height="12" fill="#FECC02" />
      <rect y="4.5" width="20" height="3" fill="#FECC02" />
    </svg>
  )
}

function FlagGB() {
  return (
    <svg viewBox="0 0 60 36" className="h-3.5 w-6 rounded-sm" aria-hidden>
      <rect width="60" height="36" fill="#012169" />
      <line x1="0" y1="0" x2="60" y2="36" stroke="white" strokeWidth="12" />
      <line x1="60" y1="0" x2="0" y2="36" stroke="white" strokeWidth="12" />
      <line x1="0" y1="0" x2="60" y2="36" stroke="#C8102E" strokeWidth="7" />
      <line x1="60" y1="0" x2="0" y2="36" stroke="#C8102E" strokeWidth="7" />
      <rect x="0" y="14" width="60" height="8" fill="white" />
      <rect x="26" y="0" width="8" height="36" fill="white" />
      <rect x="0" y="16" width="60" height="4" fill="#C8102E" />
      <rect x="28" y="0" width="4" height="36" fill="#C8102E" />
    </svg>
  )
}

const FLAG: Record<Language, () => React.JSX.Element> = { en: FlagGB, sv: FlagSV }

export function LanguageBadge({ lang }: { lang: Language }) {
  const Flag = FLAG[lang]
  return (
    <span className="inline-block overflow-hidden rounded-sm align-middle ring-1 ring-inset ring-black/30">
      <Flag />
    </span>
  )
}

export function LanguageBadges({ langs }: { langs: Language[] }) {
  return (
    <span className="flex items-center gap-1">
      {langs.map((l) => <LanguageBadge key={l} lang={l} />)}
    </span>
  )
}
