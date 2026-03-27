import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Code2, Plus, Trash2, Copy, Check, RotateCcw } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type QueryType = 'query' | 'mutation' | 'subscription'

interface Field {
  id: string
  name: string
  isNested: boolean
  nestedFields: { id: string; name: string }[]
}

interface Variable {
  id: string
  name: string
  type: string
  required: boolean
}

function genId() { return Math.random().toString(36).slice(2) }

function buildQuery(queryType: QueryType, opName: string, typeName: string, fields: Field[], variables: Variable[]): string {
  const varStr = variables.length > 0
    ? `(${variables.map(v => `$${v.name}: ${v.type}${v.required ? '!' : ''}`).join(', ')})`
    : ''
  const fieldsStr = fields.filter(f => f.name.trim()).map(f => {
    if (f.isNested && f.nestedFields.length > 0) {
      const nested = f.nestedFields.filter(nf => nf.name.trim()).map(nf => `      ${nf.name}`).join('\n')
      return `    ${f.name} {\n${nested}\n    }`
    }
    return `    ${f.name}`
  }).join('\n')
  const name = opName.trim() || ''
  const type = typeName.trim() || 'Type'
  return `${queryType}${name ? ' ' + name : ''}${varStr} {\n  ${type.charAt(0).toLowerCase() + type.slice(1)} {\n${fieldsStr}\n  }\n}`
}

export default function GraphqlBuilder() {
  const { t } = useTranslation('toolGraphqlBuilder')
  const [queryType, setQueryType] = useState<QueryType>('query')
  const [opName, setOpName] = useState('')
  const [typeName, setTypeName] = useState('')
  const [fields, setFields] = useState<Field[]>([{ id: genId(), name: '', isNested: false, nestedFields: [] }])
  const [variables, setVariables] = useState<Variable[]>([])
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const addField = () => setFields(f => [...f, { id: genId(), name: '', isNested: false, nestedFields: [] }])
  const removeField = (id: string) => setFields(f => f.filter(x => x.id !== id))
  const updateField = (id: string, patch: Partial<Field>) => setFields(f => f.map(x => x.id === id ? { ...x, ...patch } : x))
  const addNestedField = (fid: string) => setFields(f => f.map(x => x.id === fid ? { ...x, nestedFields: [...x.nestedFields, { id: genId(), name: '' }] } : x))
  const updateNested = (fid: string, nid: string, name: string) => setFields(f => f.map(x => x.id === fid ? { ...x, nestedFields: x.nestedFields.map(n => n.id === nid ? { ...n, name } : n) } : x))
  const removeNested = (fid: string, nid: string) => setFields(f => f.map(x => x.id === fid ? { ...x, nestedFields: x.nestedFields.filter(n => n.id !== nid) } : x))

  const addVariable = () => setVariables(v => [...v, { id: genId(), name: '', type: '', required: true }])
  const removeVar = (id: string) => setVariables(v => v.filter(x => x.id !== id))
  const updateVar = (id: string, patch: Partial<Variable>) => setVariables(v => v.map(x => x.id === id ? { ...x, ...patch } : x))

  const handleGenerate = () => setOutput(buildQuery(queryType, opName, typeName, fields, variables))

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleReset = () => {
    setQueryType('query'); setOpName(''); setTypeName('')
    setFields([{ id: genId(), name: '', isNested: false, nestedFields: [] }])
    setVariables([]); setOutput('')
  }

  const inputCls = 'border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero icon={Code2} titleKey="title" descriptionKey="description" namespace="toolGraphqlBuilder" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Query type & name */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div className="flex gap-2">
            {(['query','mutation','subscription'] as QueryType[]).map(qt => (
              <button key={qt} onClick={() => setQueryType(qt)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${queryType === qt ? 'bg-indigo-600 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                {t(qt)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">{t('operationName')}</label>
              <input className={inputCls} placeholder={t('operationNamePlaceholder')} value={opName} onChange={e => setOpName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">{t('typeName')}</label>
              <input className={inputCls} placeholder={t('typeNamePlaceholder')} value={typeName} onChange={e => setTypeName(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('fields')}</h2>
            <button onClick={addField} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
              <Plus className="w-3.5 h-3.5" />{t('addField')}
            </button>
          </div>
          <div className="space-y-2">
            {fields.map(f => (
              <div key={f.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input className={inputCls} placeholder={t('fieldNamePlaceholder')} value={f.name} onChange={e => updateField(f.id, { name: e.target.value })} />
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap cursor-pointer">
                    <input type="checkbox" checked={f.isNested} onChange={e => updateField(f.id, { isNested: e.target.checked })} className="accent-indigo-600" />
                    {t('isNested')}
                  </label>
                  <button onClick={() => removeField(f.id)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
                {f.isNested && (
                  <div className="pl-4 space-y-1.5">
                    {f.nestedFields.map(nf => (
                      <div key={nf.id} className="flex items-center gap-2">
                        <input className={inputCls} placeholder={t('fieldNamePlaceholder')} value={nf.name} onChange={e => updateNested(f.id, nf.id, e.target.value)} />
                        <button onClick={() => removeNested(f.id, nf.id)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                    <button onClick={() => addNestedField(f.id)} className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                      <Plus className="w-3 h-3" />{t('addNestedField')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variables */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('variables')}</h2>
            <button onClick={addVariable} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
              <Plus className="w-3.5 h-3.5" />{t('addVariable')}
            </button>
          </div>
          {variables.length === 0 ? <p className="text-xs text-gray-400">{t('addVariable')}</p> : (
            <div className="space-y-2">
              {variables.map(v => (
                <div key={v.id} className="flex items-center gap-2">
                  <input className={inputCls} placeholder={t('varName')} value={v.name} onChange={e => updateVar(v.id, { name: e.target.value })} />
                  <input className={inputCls} placeholder={t('varTypePlaceholder')} value={v.type} onChange={e => updateVar(v.id, { type: e.target.value })} />
                  <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap cursor-pointer">
                    <input type="checkbox" checked={v.required} onChange={e => updateVar(v.id, { required: e.target.checked })} className="accent-indigo-600" />
                    {t('required')}
                  </label>
                  <button onClick={() => removeVar(v.id)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleGenerate} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">{t('generate')}</button>
          <button onClick={handleReset} className="px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4" />{t('reset')}
          </button>
        </div>

        {/* Output */}
        {output && (
          <div className="bg-gray-900 rounded-2xl p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">{t('output')}</span>
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
