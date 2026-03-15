import React, { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import Input from './Input'
import Button from './Button'

export interface DnsQueryFormProps {
  initialDomain?: string
  initialType?: string
  initialServer?: string
  onQuery: (params: { domain: string; type: string; server?: string }) => void
  loading?: boolean
  recordTypes?: string[]
  showServerInput?: boolean
  serverPlaceholder?: string
  domainPlaceholder?: string
  buttonText?: string
}

const DEFAULT_RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'PTR']

const DnsQueryForm: React.FC<DnsQueryFormProps> = ({
  initialDomain = '',
  initialType = 'A',
  initialServer = '',
  onQuery,
  loading = false,
  recordTypes = DEFAULT_RECORD_TYPES,
  showServerInput = false,
  serverPlaceholder = '8.8.8.8 (Optional)',
  domainPlaceholder = 'example.com',
  buttonText = 'Query'
}) => {
  const [domain, setDomain] = useState(initialDomain)
  const [recordType, setRecordType] = useState(initialType)
  const [server, setServer] = useState(initialServer)

  // Sync internal state when props change (for history restoration)
  React.useEffect(() => {
    setDomain(initialDomain)
  }, [initialDomain])

  React.useEffect(() => {
    setRecordType(initialType)
  }, [initialType])

  React.useEffect(() => {
    setServer(initialServer)
  }, [initialServer])

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!domain.trim()) return
    onQuery({ domain: domain.trim(), type: recordType, server: server.trim() })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 w-full">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Domain
          </label>
          <Input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={domainPlaceholder}
          />
        </div>
        
        <div className="w-full md:w-32">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            {recordTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {showServerInput && (
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              DNS Server
            </label>
            <Input
              type="text"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={serverPlaceholder}
            />
          </div>
        )}

        <div className="w-full md:w-auto">
          <Button
            onClick={handleSubmit}
            disabled={loading || !domain.trim()}
            className="w-full md:w-auto flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DnsQueryForm
