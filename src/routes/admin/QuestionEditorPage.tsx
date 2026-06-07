import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { compressImageToDataUrl, dataUrlByteSize } from '../../lib/imageCompression'
import { createQuestion, getQuestion, updateQuestion } from '../../lib/questions'

const MAX_IMAGE_BYTES = 700_000

export function QuestionEditorPage() {
  const { id } = useParams()
  const isNew = id === undefined
  const navigate = useNavigate()

  const [imageData, setImageData] = useState('')
  const [trivia, setTrivia] = useState('')
  const [prompt, setPrompt] = useState('')
  const [correctYear, setCorrectYear] = useState('')
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
      setTrivia(question.trivia)
      setPrompt(question.prompt)
      setCorrectYear(String(question.correctYear))
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
    if (!trivia.trim()) return setError('Add some trivia text.')
    if (!prompt.trim()) return setError('Add the question prompt.')
    if (!Number.isInteger(year) || year < 1900 || year > 2026) return setError('Correct year must be between 1900 and 2026.')
    if (dataUrlByteSize(imageData) > MAX_IMAGE_BYTES) {
      return setError('Image is too large even after compression — try a smaller or simpler image.')
    }

    setSaving(true)
    try {
      const input = { imageData, trivia: trivia.trim(), prompt: prompt.trim(), correctYear: year }
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
      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">{isNew ? 'New question' : 'Edit question'}</h1>

        <label className="flex flex-col gap-1 text-sm">
          Image
          <input type="file" accept="image/*" onChange={(e) => void handleImageChange(e)} className="text-sm" />
          {compressing && <span className="text-slate-400">Compressing…</span>}
          {imageData && !compressing && (
            <span className="text-slate-500">{Math.round(dataUrlByteSize(imageData) / 1024)} KB after compression</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Trivia
          <textarea
            value={trivia}
            onChange={(e) => setTrivia(e.target.value)}
            rows={3}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Question prompt
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>

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
        <h2 className="text-sm font-medium text-slate-400">Preview — roughly how this looks on the host screen</h2>
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="aspect-video overflow-hidden rounded-xl bg-slate-800">
            {imageData && <img src={imageData} alt="" className="h-full w-full object-cover" />}
          </div>
          <p className="text-slate-300">{trivia || <span className="text-slate-600">Trivia text appears here…</span>}</p>
          <p className="text-2xl font-semibold">{prompt || <span className="text-slate-600">Question prompt appears here…</span>}</p>
        </div>
      </div>
    </div>
  )
}
