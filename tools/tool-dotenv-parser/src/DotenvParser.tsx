import React, { useMemo, useState } from 'react'
import {
  Button,
  Card,
  DataTable,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  TextArea,
  cn,
  type DataTableColumn,
} from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, FileKey2, ShieldCheck, TriangleAlert } from 'lucide-react'
import {
  parseInput,
  serialize,
  type EnvEntry,
  type InputFormat,
  type OutputFormat,
  type ParseIssue,
  type ParseResult,
} from './lib/dotenv'

const SAMPLE_ENV = `# 应用配置 / App config
export API_KEY="sk-1234567890"
DB_HOST=localhost
DB_PORT=5432
DEBUG=true # 行内注释 inline comment
GREETING="hello\\nworld"
RAW_PATH='C:\\Users\\me'
EMPTY=
TAGS=a b c`

const SAMPLE_JSON = `{
  "API_KEY": "sk-1234567890",
  "DB_HOST": "localhost",
  "DB_PORT": "5432",
  "DEBUG": "true"
}`

const OUTPUT_FORMATS: OutputFormat[] = ['env', 'json', 'yaml', 'shell']

const DotenvParser: React.FC = () => {
  const { t } = useTranslation('toolDotenvParser')

  const [inputFormat, setInputFormat] = useState<InputFormat>('env')
  const [text, setText] = useState<string>('')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('json')
  const [copied, setCopied] = useState(false)

  const parsed = useMemo(
    () => (text.trim() ? parseInput(text, inputFormat) : null),
    [text, inputFormat]
  )

  const result: ParseResult | null = parsed && parsed.ok ? parsed.result : null
  const jsonErrorMessage =
    parsed && !parsed.ok
      ? parsed.message === 'not-an-object'
        ? t('jsonNotObject')
        : t('jsonError', { msg: parsed.message })
      : null

  const output = useMemo(
    () => (result ? serialize(result.entries, outputFormat) : ''),
    [result, outputFormat]
  )

  const onCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }

  const loadSample = () => {
    setText(inputFormat === 'json' ? SAMPLE_JSON : SAMPLE_ENV)
  }

  const quoteLabel = (q: EnvEntry['quoted']) =>
    q === 'single'
      ? t('table.quoteSingle')
      : q === 'double'
        ? t('table.quoteDouble')
        : t('table.quoteNone')

  const columns: DataTableColumn<EnvEntry>[] = [
    {
      key: 'key',
      header: t('table.key'),
      className: 'w-1/4',
      cell: (row) => (
        <code className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">
          {row.key}
        </code>
      ),
    },
    {
      key: 'value',
      header: t('table.value'),
      cell: (row) =>
        row.value === '' ? (
          <span className="text-gray-400 dark:text-gray-500">{t('table.emptyValue')}</span>
        ) : (
          <code className="whitespace-pre-wrap break-all font-mono text-sm text-gray-700 dark:text-gray-200">
            {row.value}
          </code>
        ),
    },
    {
      key: 'quoted',
      header: t('table.quoted'),
      className: 'w-20',
      cell: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{quoteLabel(row.quoted)}</span>
      ),
    },
  ]

  const issueText = (issue: ParseIssue): string => {
    switch (issue.type) {
      case 'duplicate':
        return t('issues.duplicate', { key: issue.key, line: issue.line })
      case 'empty-key':
        return t('issues.emptyKey', { line: issue.line })
      case 'invalid-key':
        return issue.line
          ? t('issues.invalidKey', { key: issue.key, line: issue.line })
          : t('issues.invalidKeyNoLine', { key: issue.key })
      case 'suspicious-unquoted':
        return t('issues.suspiciousUnquoted', { key: issue.key, line: issue.line })
      case 'no-equals':
        return t('issues.noEquals', { line: issue.line, raw: issue.raw })
      default:
        return ''
    }
  }

  const stats = result?.stats
  const issues = result?.issues ?? []

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="success"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={ShieldCheck}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 输入 */}
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('input.heading')}
              </h2>
              <div className="flex gap-1.5">
                <SegButton active={inputFormat === 'env'} onClick={() => setInputFormat('env')}>
                  {t('input.formatEnv')}
                </SegButton>
                <SegButton active={inputFormat === 'json'} onClick={() => setInputFormat('json')}>
                  {t('input.formatJson')}
                </SegButton>
              </div>
            </div>

            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                inputFormat === 'json' ? t('input.placeholderJson') : t('input.placeholderEnv')
              }
              spellCheck={false}
              rows={12}
              className="font-mono text-sm"
            />

            <div className="mt-3 flex gap-2">
              <Button variant="secondary" size="sm" onClick={loadSample}>
                {t('input.sample')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setText('')}>
                {t('input.clear')}
              </Button>
            </div>

            {jsonErrorMessage && (
              <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{jsonErrorMessage}</p>
            )}
          </Card>

          {/* 输出 */}
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('output.heading')}
              </h2>
              <div className="flex gap-1.5">
                {OUTPUT_FORMATS.map((fmt) => (
                  <SegButton
                    key={fmt}
                    active={outputFormat === fmt}
                    onClick={() => setOutputFormat(fmt)}
                  >
                    {t(`output.${fmt}`)}
                  </SegButton>
                ))}
              </div>
            </div>

            {output ? (
              <div className="relative">
                <pre className="max-h-80 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-100">
                  {output}
                </pre>
                <button
                  type="button"
                  onClick={onCopy}
                  className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 text-xs text-gray-600 shadow-sm backdrop-blur hover:text-gray-900 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                  {copied ? t('output.copied') : t('output.copy')}
                </button>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500">
                {t('output.empty')}
              </p>
            )}
          </Card>
        </div>

        {/* 统计 */}
        {stats && (
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('stats.heading')}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label={t('stats.total')} value={stats.total} />
              <Stat label={t('stats.comments')} value={stats.comments} />
              <Stat label={t('stats.blanks')} value={stats.blanks} />
              <Stat label={t('stats.issues')} value={issues.length} tone={issues.length > 0 ? 'warn' : 'ok'} />
            </div>
          </Card>
        )}

        {/* 校验提示 */}
        {issues.length > 0 && (
          <Card>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <TriangleAlert className="h-5 w-5 text-amber-500" />
              {t('issues.heading')}
            </h2>
            <ul className="space-y-1.5">
              {issues.map((issue, i) => (
                <li
                  key={`${issue.type}-${issue.key ?? ''}-${issue.line ?? i}-${i}`}
                  className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                >
                  {issueText(issue)}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* 解析结果表 */}
        {result && (
          <Card>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <FileKey2 className="h-5 w-5 text-indigo-500" />
              {t('table.heading')}
            </h2>
            <DataTable
              columns={columns}
              rows={result.entries}
              rowKey={(row, i) => `${row.key}-${row.line}-${i}`}
              emptyText={t('table.empty')}
            />
          </Card>
        )}
      </div>
    </div>
  )
}

const SegButton: React.FC<{
  active: boolean
  onClick: () => void
  children: React.ReactNode
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
      active
        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
    )}
  >
    {children}
  </button>
)

const Stat: React.FC<{ label: string; value: number; tone?: 'ok' | 'warn' }> = ({
  label,
  value,
  tone = 'ok',
}) => (
  <div className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
    <div
      className={cn(
        'text-2xl font-bold',
        tone === 'warn'
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-gray-900 dark:text-gray-100'
      )}
    >
      {value}
    </div>
    <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
  </div>
)

export default DotenvParser
