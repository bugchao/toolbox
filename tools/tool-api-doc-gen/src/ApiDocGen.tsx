import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Copy, Download, Plus, Trash2 } from 'lucide-react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { ApiData, Parameter, Response, METHODS, PARAM_TYPES } from './types'
import { parseOpenApi, generateMarkdown, generateHtml } from './utils'

export default function ApiDocGen() {
  const { t } = useTranslation('toolApiDocGen')
  const [inputMode, setInputMode] = useState<'manual' | 'import'>('manual')
  const [apiData, setApiData] = useState<ApiData>({
    name: '', method: 'GET', url: '', description: '', parameters: [], responses: []
  })
  const [jsonInput, setJsonInput] = useState('')
  const [previewFormat, setPreviewFormat] = useState<'markdown' | 'html'>('markdown')
  const [message, setMessage] = useState('')

  const addParameter = (paramIn: 'path' | 'query' | 'header' | 'body') => {
    setApiData(prev => ({ ...prev, parameters: [...prev.parameters, { name: '', type: 'string', required: false, description: '', in: paramIn }] }))
  }

  const removeParameter = (index: number) => {
    setApiData(prev => ({ ...prev, parameters: prev.parameters.filter((_, i) => i !== index) }))
  }

  const updateParameter = (index: number, field: keyof Parameter, value: any) => {
    setApiData(prev => ({ ...prev, parameters: prev.parameters.map((p, i) => i === index ? { ...p, [field]: value } : p) }))
  }

  const addResponse = () => {
    setApiData(prev => ({ ...prev, responses: [...prev.responses, { statusCode: '200', description: '', example: '' }] }))
  }

  const removeResponse = (index: number) => {
    setApiData(prev => ({ ...prev, responses: prev.responses.filter((_, i) => i !== index) }))
  }

  const updateResponse = (index: number, field: keyof Response, value: string) => {
    setApiData(prev => ({ ...prev, responses: prev.responses.map((r, i) => i === index ? { ...r, [field]: value } : r) }))
  }

  const handleParseJson = () => {
    const parsed = parseOpenApi(jsonInput)
    if (parsed) {
      setApiData(parsed)
      setMessage(t('parseSuccess'))
      setInputMode('manual')
    } else {
      setMessage(t('parseError'))
    }
  }

  const markdown = useMemo(() => generateMarkdown(apiData, t), [apiData, t])
  const html = useMemo(() => generateHtml(markdown), [markdown])
