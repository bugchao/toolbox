import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { Search, Loader2, Play, CheckCircle, XCircle } from 'lucide-react'

// Simple UI for DNS Propagation
const DnsPropagation: React.FC = () => {
    const { t } = useTranslation('toolDnsPropagation')

    const [domain, setDomain] = useState('')
    const [recordType, setRecordType] = useState('A')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any[]>([])
    const [error, setError] = useState('')

    // Mock global DNS servers
    const servers = [
        { id: '1', name: 'Google DNS', location: 'Global (US)', ip: '8.8.8.8' },
        { id: '2', name: 'Cloudflare', location: 'Global (US)', ip: '1.1.1.1' },
        { id: '3', name: 'Alibaba DNS', location: 'China (CN)', ip: '223.5.5.5' },
        { id: '4', name: 'Quad9', location: 'Global (CH)', ip: '9.9.9.9' },
        { id: '5', name: 'OpenDNS', location: 'Global (US)', ip: '208.67.222.222' },
        { id: '6', name: 'Tencent', location: 'China (CN)', ip: '119.29.29.29' }
    ]

    const handleCheck = async () => {
        if (!domain.trim()) {
            setError(t('error_empty_domain'))
            return
        }

        setLoading(true)
        setError('')
        setResults([])

        // Simulate propagation check across different servers using Google DoH API for demo purposes
        // In a real application, backend calls would be made from designated geographical locations
        const checkServer = async (server: any) => {
            try {
                // Just mocking the delay for each server to simulate global checking
                await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

                const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${recordType}`)
                const data = await response.json()

                let answers = []
                if (data.Status === 0 && data.Answer) {
                    answers = data.Answer.map((a: any) => a.data)
                }

                return {
                    ...server,
                    status: data.Status === 0 ? 'success' : 'failed',
                    answers
                }
            } catch (e) {
                return { ...server, status: 'error', answers: [] }
            }
        }

        try {
            // In reality we would fire these off and update state as they complete
            const serverChecks = servers.map(server => checkServer(server))
            const resolvedResults = await Promise.all(serverChecks)
            setResults(resolvedResults)

        } catch (e) {
            setError((e as Error).message)
        } finally {
            setLoading(false)
        }
    }

    // Calculate stats
    const total = results.length
    const successCount = results.filter(r => r.status === 'success').length
    const progressPercent = total > 0 ? (successCount / total) * 100 : 0

    // Find the most common answer to calculate a simple "consensus"
    let expectedAnswer = ''
    if (results.length > 0) {
        const answerCounts: Record<string, number> = {}
        results.forEach(r => {
            if (r.answers && r.answers.length > 0) {
                const repr = r.answers.join(', ')
                answerCounts[repr] = (answerCounts[repr] || 0) + 1
            }
        })

        let max = 0
        Object.keys(answerCounts).forEach(key => {
            if (answerCounts[key] > max) {
                max = answerCounts[key]
                expectedAnswer = key
            }
        })
    }

    return (
        <div className="max-w-6xl mx-auto">
            <PageHero
                title={t('title')}
                description={t('description')}
                className="mb-8"
            />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('domain_label')}
                        </label>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="example.com"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('type_label')}
                        </label>
                        <select
                            value={recordType}
                            onChange={(e) => setRecordType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="A">A</option>
                            <option value="AAAA">AAAA</option>
                            <option value="CNAME">CNAME</option>
                            <option value="MX">MX</option>
                            <option value="TXT">TXT</option>
                            <option value="NS">NS</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleCheck}
                            disabled={loading}
                            className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            {t('start_check')}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}
            </div>

            {results.length > 0 && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{t('propagation_status')}</h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {successCount} / {total} {t('servers_responded')}
                            </div>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6 overflow-hidden">
                            <div
                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.map((result) => {
                                const answerStr = result.answers ? result.answers.join(', ') : '';
                                const isMatch = expectedAnswer === answerStr;

                                return (
                                    <div key={result.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-start gap-4">
                                        <div className="mt-1">
                                            {result.status === 'success' ? (
                                                isMatch ? (
                                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-yellow-500" />
                                                )
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{result.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{result.location}</span>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{result.ip}</div>
                                            <div className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate" title={answerStr}>
                                                {result.status === 'success' ? (answerStr || 'No answer') : 'Resolution failed'}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DnsPropagation
