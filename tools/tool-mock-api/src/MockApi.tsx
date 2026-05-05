import React, { useState } from 'react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { faker } from '@faker-js/faker'
import { Copy, Download, Plus, Trash2, RefreshCw } from 'lucide-react'

interface FieldConfig {
  id: string
  name: string
  type: string
  isArray?: boolean
}

const FIELD_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'uuid', label: 'UUID' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'DateTime' },
  { value: 'name', label: 'Name' },
  { value: 'phone', label: 'Phone' },
  { value: 'address', label: 'Address' },
  { value: 'company', label: 'Company' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'image', label: 'Image URL' },
]

const MockApi: React.FC = () => {
  const { t } = useTranslation('toolMockApi')
  const [fields, setFields] = useState<FieldConfig[]>([
    { id: '1', name: 'id', type: 'uuid' },
    { id: '2', name: 'name', type: 'name' },
    { id: '3', name: 'email', type: 'email' },
  ])
  const [count, setCount] = useState(10)
  const [mockData, setMockData] = useState<any[]>([])
  const [copied, setCopied] = useState(false)

  const addField = () => {
    setFields([
      ...fields,
      { id: Date.now().toString(), name: '', type: 'string' },
    ])
  }

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  const updateField = (id: string, key: keyof FieldConfig, value: any) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)))
  }

  const generateValue = (type: string): any => {
    switch (type) {
      case 'string':
        return faker.lorem.word()
      case 'number':
        return faker.number.int({ min: 1, max: 1000 })
      case 'boolean':
        return faker.datatype.boolean()
      case 'email':
        return faker.internet.email()
      case 'url':
        return faker.internet.url()
      case 'uuid':
        return faker.string.uuid()
      case 'date':
        return faker.date.past().toISOString().split('T')[0]
      case 'datetime':
        return faker.date.past().toISOString()
      case 'name':
        return faker.person.fullName()
      case 'phone':
        return faker.phone.number()
      case 'address':
        return faker.location.streetAddress()
      case 'company':
        return faker.company.name()
      case 'paragraph':
        return faker.lorem.paragraph()
      case 'image':
        return faker.image.url()
      default:
        return faker.lorem.word()
    }
  }

  const generateMockData = () => {
    const data = Array.from({ length: count }, () => {
      const item: any = {}
      fields.forEach((field) => {
        if (!field.name) return
        if (field.isArray) {
          item[field.name] = Array.from({ length: 3 }, () =>
            generateValue(field.type)
          )
        } else {
          item[field.name] = generateValue(field.type)
        }
      })
      return item
    })
    setMockData(data)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(mockData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(mockData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mock-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schema Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('schemaEditor')}
              </h3>
              <button
                onClick={addField}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Plus size={16} />
                {t('addField')}
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) =>
                      updateField(field.id, 'name', e.target.value)
                    }
                    placeholder={t('fieldName')}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(field.id, 'type', e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={field.isArray || false}
                      onChange={(e) =>
                        updateField(field.id, 'isArray', e.target.checked)
                      }
                      className="rounded"
                    />
                    {t('array')}
                  </label>
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('dataCount')}
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={generateMockData}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <RefreshCw size={18} />
              {t('generate')}
            </button>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('preview')}
              </h3>
              {mockData.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    <Copy size={16} />
                    {copied ? t('copied') : t('copy')}
                  </button>
                  <button
                    onClick={downloadJson}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Download size={16} />
                    {t('download')}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[500px] overflow-auto">
              {mockData.length > 0 ? (
                <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                  {JSON.stringify(mockData, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {t('noData')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MockApi
