import React, { useMemo, useState } from 'react'
import { Lock, ArrowRightLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Input, NoticeCard, PageHero } from '@toolbox/ui-kit'

type CipherMode = 'base64' | 'rot13' | 'caesar'
type Direction = 'encode' | 'decode'

function encodeUnicodeBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)))
}

function decodeUnicodeBase64(value: string) {
  return decodeURIComponent(escape(atob(value)))
}

function applyRot13(value: string) {
  return value.replace(/[a-zA-Z]/g, (char) => {
    const start = char <= 'Z' ? 65 : 97
    return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start)
  })
}

function applyCaesar(value: string, shift: number) {
  return value.replace(/[a-zA-Z]/g, (char) => {
    const start = char <= 'Z' ? 65 : 97
    return String.fromCharCode(((char.charCodeAt(0) - start + shift + 26 * 10) % 26) + start)
  })
}

export default function TextCipher() {
  const { t } = useTranslation('toolTextCipher')
  const [mode, setMode] = useState<CipherMode>('base64')
  const [direction, setDirection] = useState<Direction>('encode')
  const [input, setInput] = useState('Hello Bug Tide')
  const [shift, setShift] = useState('3')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const notes = useMemo(() => t('notes', { returnObjects: true }) as string[], [t])

  const handleTransform = () => {
    setError(null)
    try {
      if (mode === 'base64') {
        setOutput(direction === 'encode' ? encodeUnicodeBase64(input) : decodeUnicodeBase64(input))
        return
      }
      if (mode === 'rot13') {
        setOutput(applyRot13(input))
        return
      }
      const numericShift = parseInt(shift, 10)
      if (Number.isNaN(numericShift)) throw new Error(t('errors.invalidShift'))
      setOutput(applyCaesar(input, direction === 'encode' ? numericShift : -numericShift))
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : t('errors.failed'))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <PageHero icon={Lock} title={t('title')} description={t('description')} />
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.mode')}</div>
            <select value={mode} onChange={(event) => setMode(event.target.value as CipherMode)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
              <option value="base64">Base64</option>
              <option value="rot13">ROT13</option>
              <option value="caesar">Caesar</option>
            </select>
          </label>
          <label className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.direction')}</div>
            <select value={direction} onChange={(event) => setDirection(event.target.value as Direction)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
              <option value="encode">{t('form.encode')}</option>
              <option value="decode">{t('form.decode')}</option>
            </select>
          </label>
        </div>

        {mode === 'caesar' ? (
          <label className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.shift')}</div>
            <Input value={shift} onChange={(event) => setShift(event.target.value)} placeholder="3" />
          </label>
        ) : null}

        <label className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.input')}</div>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={6}
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <div className="flex justify-end">
          <Button onClick={handleTransform}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            {t('form.submit')}
          </Button>
        </div>
      </Card>

      {error ? <NoticeCard tone="danger" title={error} /> : null}

      <Card className="space-y-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('result.label')}</div>
        <textarea
          readOnly
          value={output}
          rows={6}
          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/70"
        />
      </Card>

      <Card className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('notesTitle')}</div>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          {notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
