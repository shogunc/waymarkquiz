import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LanguageBadge } from '../../components/LanguageBadge'
import { compressImageToDataUrl, dataUrlByteSize } from '../../lib/imageCompression'
import { createQuestion, getQuestion, updateQuestion } from '../../lib/questions'
import type { Language } from '../../types'

const MAX_IMAGE_BYTES = 700_000
const LANGS: { value: Language; label: string }[] = [
  { value: 'sv', label: 'Svenska' },
  { value: 'en', label: 'English' },
]

export function QuestionEditorPage() {
  const { id } = useParams()
  const isNew = id === undefined
  const navigate = useNavigate()

  const [imageData, setImageData] = useState('')
  const [trivia, setTrivia] = useState<Record<Language, string>>({ en: '', sv: '' })
  const [prompt, setPrompt] = useState<Record<Language, string>>({ en: '', sv: '' })
  const [correctYear, setCorrectYear] = useState('')
  const [previewLang, setPreviewLang] = useState<Language>('sv')
  const [loading, setLoading] = useState(!isNew)
  const [compressing, setCompressing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isNew) return
    void (async () => {
      const question = await getQuestion(id)
      if (!question) {
        setError('Question not found.')
        setLoading(false)
        return
      }
      setImageData(question.imageData)
      setTrivia({ en: question.trivia.en ?? '', sv: question.trivia.sv ?? '' })
      setPrompt({ en: question.prompt.en ?? '', sv: question.prompt.sv ?? '' })
      setCorrectYear(String(question.correctYear))
      // Default preview to whichever language has content.
      if (question.trivia.en?.trim()) setPreviewLang('en')
      setLoading(false)
    })()
  }, [id, isNew])

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setCompressing(true)
    try {
      setImageData(await compressImageToDataUrl(file))
    } catch {
      setError('Could not process that image — try a different file.')
    } finally {
      setCompressing(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const year = Number(correctYear)
    if (!imageData) return setError('Add an image.')
    const hasValidPair = LANGS.some((l) => trivia[l.value].trim() && prompt[l.value].trim())
    if (!hasValidPair) return setError('Add trivia and a question prompt in at least one language.')
    if (!Number.isInteger(year) || year < 1900 || year > 2026) return setError('Correct year must be between 1900 and 2026.')
    if (dataUrlByteSize(imageData) > MAX_IMAGE_BYTES) {
      return setError('Image is too large even after compression — try a smaller or simpler image.')
    }

    setSaving(true)
    try {
      const input = {
        imageData,
        trivia: Object.fromEntries(LANGS.filter((l) => trivia[l.value].trim()).map((l) => [l.value, trivia[l.value].trim()])) as Partial<Record<Language, string>>,
        prompt: Object.fromEntries(LANGS.filter((l) => prompt[l.value].trim()).map((l) => [l.value, prompt[l.value].trim()])) as Partial<Record<Language, string>>,
        correctYear: year,
      }
      if (isNew) {
        await createQuestion(input)
      } else {
        await updateQuestion(id, input)
      }
      navigate('..')
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-slate-400">Loading…</p>

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">{isNew ? 'New question' : 'Edit question'}</h1>

        <label className="flex flex-col gap-1 text-sm">
          Image
          <input type="file" accept="image/*" onChange={(e) => void handleImageChange(e)} className="text-sm" />
          {compressing && <span className="text-slate-400">Compressing…</span>}
          {imageData && !compressing && (
            <span className="text-slate-500">{Math.round(dataUrlByteSize(imageData) / 1024)} KB after compression</span>
          )}
        </label>

        {LANGS.map(({ value, label }) => (
          <div key={value} className="flex flex-col gap-3 rounded-xl border border-slate-800 p-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-slate-300"><LanguageBadge lang={value} /> {label}</h2>
            <label className="flex flex-col gap-1 text-sm">
              Trivia
              <textarea
                value={trivia[value]}
                onChange={(e) => setTrivia((t) => ({ ...t, [value]: e.target.value }))}
                rows={3}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Question prompt
              <textarea
                value={prompt[value]}
                onChange={(e) => { setPrompt((p) => ({ ...p, [value]: e.target.value })); setPreviewLang(value) }}
                rows={2}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500"
              />
            </label>
          </div>
        ))}

        <label className="flex flex-col gap-1 text-sm">
          Correct year
          <input
            type="number"
            min={1900}
            max={2026}
            value={correctYear}
            onChange={(e) => setCorrectYear(e.target.value)}
            className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>

        {error && <p className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || compressing}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('..')}
            className="rounded-lg border border-slate-700 px-4 py-2 font-medium hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-400">Preview — roughly how this looks on the host screen</h2>
          <div className="flex overflow-hidden rounded-lg border border-slate-700">
            {LANGS.map(({ value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPreviewLang(value)}
                className={`px-3 py-1 text-sm transition-colors ${previewLang === value ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
              >
                <LanguageBadge lang={value} />
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="aspect-video overflow-hidden rounded-xl bg-slate-800">
            {imageData && <img src={imageData} alt="" className="h-full w-full object-cover" />}
          </div>
          <p className="text-slate-300">
            {trivia[previewLang] || <span className="text-slate-600">Trivia text appears here…</span>}
          </p>
          <p className="text-2xl font-semibold">
            {prompt[previewLang] || <span className="text-slate-600">Question prompt appears here…</span>}
          </p>
        </div>
      </div>
    </div>
  )
}
