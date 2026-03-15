import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { Search, Loader2, Play } from 'lucide-react'

// Simple UI for DNS trace
const DnsTrace: React.FC = () => {
    const { t } = useTranslation('toolDnsTrace')
    const { t: tHome } = useTranslation('home')

    const [domain, setDomain] = useState('')
    const [recordType, setRecordType] = useState('A')
    const [loading, setLoading] = useState(false)
    const [traceResult, setTraceResult] = useState<any[] | null>(null)
    const [error, setError] = useState('')

    const handleTrace = async () => {
        if (!domain.trim()) {
            setError(t('error_empty_domain'))
            return
        }

        setLoading(true)
        setError('')
        setTraceResult(null)

        // Simulate recursive trace (in a real scenario, this involves backend or multiple DoH queries to root/tld/auth servers)
        // Here we'll do a simple mock or a single DoH query just for demonstration of the UI
        try {
            const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${recordType}`)
            const data = await response.json()

            if (data.Status !== 0) {
                throw new Error(`DNS Resolution failed with status: ${data.Status}`)
            }

            // Mocking trace steps
            const steps = [
                { server: 'Root Server (e.g., a.root-servers.net)', status: 'Success', detail: 'Found TLD nameservers' },
                { server: 'TLD Server', status: 'Success', detail: 'Found Authoritative nameservers' },
                { server: 'Authoritative Server', status: 'Success', detail: `Returned ${data.Answer ? data.Answer.length : 0} answers` }
            ]

            const results = steps.map((step, index) => ({
                step: index + 1,
                ...step,
                answers: index === steps.length - 1 ? data.Answer : undefined
            }))

            setTraceResult(results)
        } catch (e) {
            setError((e as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
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
                            onKeyDown={(e) => e.key === 'Enter' && handleTrace()}
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
                            onClick={handleTrace}
                            disabled={loading}
                            className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            {t('start_trace')}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}
            </div>

            {traceResult && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('trace_results')}</h3>
                    {traceResult.map((result: any, idx: number) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center font-bold">
                                    {result.step}
                                </div>
                                <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">{result.server}</h4>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    {result.status}
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 ml-11">{result.detail}</p>

                            {result.answers && Array.isArray(result.answers) && (
                                <div className="mt-3 ml-11 p-3 bg-gray-50 dark:bg-gray-900 rounded-md overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-100 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-3 py-2">Name</th>
                                                <th className="px-3 py-2">TTL</th>
                                                <th className="px-3 py-2">Data</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.answers.map((ans: any, i: number) => (
                                                <tr key={i} className="border-b dark:border-gray-700 last:border-0">
                                                    <td className="px-3 py-2 text-gray-800 dark:text-gray-300">{ans.name}</td>
                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{ans.TTL}</td>
                                                    <td className="px-3 py-2 font-mono text-indigo-600 dark:text-indigo-400">{ans.data}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DnsTrace
