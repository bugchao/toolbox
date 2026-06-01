import React, { useEffect, useState } from 'react'
import { renderMarkdown } from '../lib/markdown'

type Props = {
  content: string
  /** 容器自定义类名（外层 wrapper） */
  className?: string
}

/**
 * 用 Tailwind 子元素任意值选择器写最小样式（不依赖 @tailwindcss/typography），
 * 保持与文本输出区视觉一致。
 */
const RENDER_CLASSES = [
  'text-sm text-gray-800 dark:text-gray-100',
  '[&_h1]:mt-3 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold',
  '[&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold',
  '[&_h3]:mt-2 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold',
  '[&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:font-semibold',
  '[&_p]:my-1.5 [&_p]:leading-relaxed',
  '[&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-6',
  '[&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:my-0.5',
  '[&_a]:text-indigo-600 hover:[&_a]:underline dark:[&_a]:text-indigo-300',
  '[&_strong]:font-semibold',
  '[&_em]:italic',
  '[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] dark:[&_code]:bg-gray-800',
  '[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-gray-900 [&_pre]:p-3 [&_pre]:text-xs [&_pre]:text-gray-100',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit',
  '[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-700 dark:[&_blockquote]:text-gray-300',
  '[&_hr]:my-3 [&_hr]:border-gray-200 dark:[&_hr]:border-gray-700',
  '[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs',
  '[&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left dark:[&_th]:border-gray-700 dark:[&_th]:bg-gray-800',
  '[&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-1 dark:[&_td]:border-gray-700',
  '[&_img]:my-2 [&_img]:max-w-full [&_img]:rounded',
].join(' ')

const MarkdownView: React.FC<Props> = ({ content, className = '' }) => {
  const [html, setHtml] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    setBusy(true)
    renderMarkdown(content).then((h) => {
      if (alive) {
        setHtml(h)
        setBusy(false)
      }
    })
    return () => { alive = false }
  }, [content])

  if (!content) return null

  return (
    <div
      className={[
        'h-full min-h-[200px] overflow-y-auto rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900',
        RENDER_CLASSES,
        busy ? 'opacity-70' : '',
        className,
      ].join(' ')}
      // content 已通过 DOMPurify 净化
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default MarkdownView
