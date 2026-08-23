import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowUpRight,
  Bug,
  Github,
  Lightbulb,
  Mail,
  MessageCircleQuestion,
  ShieldCheck,
  X,
} from 'lucide-react'

export const FEEDBACK_EMAIL = 'lookdyc@gmail.com'
export const FEEDBACK_GITHUB_URL =
  'https://github.com/bugchao/toolbox/issues/new'

export type FeedbackIntent = 'problem' | 'tool'

interface FeedbackContext {
  pageTitle: string
  route: string
  pageUrl: string
}

interface FeedbackDialogProps extends FeedbackContext {
  open: boolean
  onClose: () => void
}

interface BuildFeedbackLinksOptions extends FeedbackContext {
  subject: string
  prompt: string
  pageLabel: string
  routeLabel: string
  urlLabel: string
  email?: string
  githubUrl?: string
}

export function buildFeedbackLinks({
  subject,
  prompt,
  pageTitle,
  route,
  pageUrl,
  pageLabel,
  routeLabel,
  urlLabel,
  email = FEEDBACK_EMAIL,
  githubUrl = FEEDBACK_GITHUB_URL,
}: BuildFeedbackLinksOptions) {
  const body = [
    prompt,
    '',
    '---',
    `${pageLabel}: ${pageTitle}`,
    `${routeLabel}: ${route}`,
    `${urlLabel}: ${pageUrl}`,
  ].join('\n')

  const githubParams = new URLSearchParams({ title: subject, body })

  return {
    email: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    github: `${githubUrl}?${githubParams.toString()}`,
  }
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  onClose,
  pageTitle,
  route,
  pageUrl,
}) => {
  const { t } = useTranslation('common')
  const [intent, setIntent] = useState<FeedbackIntent>('problem')
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstIntentRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    returnFocusRef.current = document.activeElement as HTMLElement | null
    setIntent('problem')
    const focusTimer = window.setTimeout(
      () => firstIntentRef.current?.focus(),
      0,
    )

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      returnFocusRef.current?.focus()
    }
  }, [open, onClose])

  const links = useMemo(() => {
    const isProblem = intent === 'problem'
    return buildFeedbackLinks({
      subject: t(
        isProblem ? 'feedback.problemSubject' : 'feedback.toolSubject',
        { pageTitle },
      ),
      prompt: t(isProblem ? 'feedback.problemPrompt' : 'feedback.toolPrompt'),
      pageTitle,
      route,
      pageUrl,
      pageLabel: t('feedback.contextPage'),
      routeLabel: t('feedback.contextRoute'),
      urlLabel: t('feedback.contextUrl'),
    })
  }, [intent, pageTitle, route, pageUrl, t])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-slate-950/55 px-3 pb-3 pt-16 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-dialog-title"
        aria-describedby="feedback-dialog-description"
        className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_30px_90px_-28px_rgba(15,23,42,0.65)] dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_58%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_52%)]" />

        <div className="relative flex items-start gap-3 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
            <MessageCircleQuestion className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-gray-900" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              {t('feedback.eyebrow')}
            </p>
            <h2
              id="feedback-dialog-title"
              className="text-xl font-bold tracking-tight text-gray-950 dark:text-white"
            >
              {t('feedback.title')}
            </h2>
            <p
              id="feedback-dialog-description"
              className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-300"
            >
              {t('feedback.description')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            aria-label={t('feedback.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5 dark:bg-gray-800/80">
            <button
              ref={firstIntentRef}
              type="button"
              onClick={() => setIntent('problem')}
              aria-pressed={intent === 'problem'}
              className={`rounded-xl px-3 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                intent === 'problem'
                  ? 'bg-white text-gray-950 shadow-sm ring-1 ring-black/5 dark:bg-gray-700 dark:text-white dark:ring-white/10'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Bug
                  className={`h-4 w-4 ${intent === 'problem' ? 'text-rose-500' : ''}`}
                />
                {t('feedback.problem')}
              </span>
              <span className="mt-1 block text-xs leading-5 opacity-75">
                {t('feedback.problemDescription')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIntent('tool')}
              aria-pressed={intent === 'tool'}
              className={`rounded-xl px-3 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                intent === 'tool'
                  ? 'bg-white text-gray-950 shadow-sm ring-1 ring-black/5 dark:bg-gray-700 dark:text-white dark:ring-white/10'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb
                  className={`h-4 w-4 ${intent === 'tool' ? 'text-amber-500' : ''}`}
                />
                {t('feedback.tool')}
              </span>
              <span className="mt-1 block text-xs leading-5 opacity-75">
                {t('feedback.toolDescription')}
              </span>
            </button>
          </div>

          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {t('feedback.chooseChannel')}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-950 px-4 py-3.5 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-white dark:text-gray-950 dark:ring-offset-gray-900"
            >
              <Github className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {t('feedback.github')}
                </span>
                <span className="block truncate text-xs opacity-65">
                  {t('feedback.githubDescription')}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a
              href={links.email}
              onClick={onClose}
              className="group flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3.5 text-indigo-950 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-100 dark:ring-offset-gray-900"
            >
              <Mail className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {t('feedback.email')}
                </span>
                <span className="block truncate text-xs opacity-65">
                  {FEEDBACK_EMAIL}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-gray-200 px-3 py-2.5 text-xs leading-5 text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{t('feedback.privacy')}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
