import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarRange, Plus, Trash2, Copy, Check, RotateCcw } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

const TIMEZONES = [
  { label: 'UTC+0 伦敦', value: 0 },
  { label: 'UTC+1 柏林/巴黎', value: 1 },
  { label: 'UTC+2 开罗', value: 2 },
  { label: 'UTC+3 莫斯科', value: 3 },
  { label: 'UTC+4 迪拜', value: 4 },
  { label: 'UTC+5:30 孟买', value: 5.5 },
  { label: 'UTC+7 曼谷', value: 7 },
  { label: 'UTC+8 北京/上海', value: 8 },
  { label: 'UTC+9 东京/首尔', value: 9 },
  { label: 'UTC+10 悉尼', value: 10 },
  { label: 'UTC-5 纽约', value: -5 },
  { label: 'UTC-6 芝加哥', value: -6 },
  { label: 'UTC-7 丹佛', value: -7 },
  { label: 'UTC-8 洛杉矶', value: -8 },
]

interface Participant {
  id: string
  name: string
  timezone: number
  workStart: number
  workEnd: number
}

interface Slot {
  utcHour: number
  times: { name: string; local: string }[]
}

function toUTC(localHour: number, offset: number) {
  return ((localHour - offset) % 24 + 24) % 24
}

function toLocal(utcHour: number, offset: number) {
  return ((utcHour + offset) % 24 + 24) % 24
}

function fmt(h: number) {
  const hour = Math.floor(h)
  const min = h % 1 === 0.5 ? '30' : '00'
  return `${String(hour).padStart(2, '0')}:${min}`
}

export default function MeetingScheduler() {
  const { t } = useTranslation('toolMeetingScheduler')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [form, setForm] = useState({ name: '', timezone: 8, workStart: 9, workEnd: 18 })
  const [duration, setDuration] = useState(60)
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [copied, setCopied] = useState<number | null>(null)

  const handleAdd = () => {
    if (!form.name.trim()) return
    setParticipants(p => [...p, { id: Date.now().toString(), ...form }])
    setForm(f => ({ ...f, name: '' }))
    setSlots(null)
  }

  const handleRemove = (id: string) => {
    setParticipants(p => p.filter(x => x.id !== id))
    setSlots(null)
  }

  const findSlots = () => {
    if (participants.length === 0) return
    const durationH = duration / 60
    const available: Slot[] = []
    for (let utc = 0; utc < 24; utc += 0.5) {
      const end = utc + durationH
      if (end > 24) break
      const allOk = participants.every(p => {
        const localStart = toLocal(utc, p.timezone)
        const localEnd = toLocal(end, p.timezone)
        return localStart >= p.workStart && localEnd <= p.workEnd
      })
      if (allOk) {
        available.push({
          utcHour: utc,
          times: participants.map(p => ({
            name: p.name,
            local: fmt(toLocal(utc, p.timezone)),
          })),
        })
      }
    }
    setSlots(available)
  }

  const handleCopy = (slot: Slot, i: number) => {
    const text = slot.times.map(t => `${t.name}: ${t.local}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  const inputCls = 'border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero icon={CalendarRange} titleKey="title" descriptionKey="description" namespace="toolMeetingScheduler" />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Add participant */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('addParticipant')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input className={inputCls + ' w-full'} placeholder={t('namePlaceholder')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">{t('timezone')}</label>
              <select className={inputCls + ' w-full'} value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: Number(e.target.value) }))}>
                {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">{t('workStart')}</label>
                <input type="number" min={0} max={23} className={inputCls + ' w-full'} value={form.workStart} onChange={e => setForm(f => ({ ...f, workStart: Number(e.target.value) }))} />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">{t('workEnd')}</label>
                <input type="number" min={1} max={24} className={inputCls + ' w-full'} value={form.workEnd} onChange={e => setForm(f => ({ ...f, workEnd: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
          <button onClick={handleAdd} className="mt-3 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />{t('add')}
          </button>
        </div>

        {/* Participants */}
        {participants.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{t('participants')}</h2>
            <ul className="space-y-2">
              {participants.map(p => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{p.name}</span>
                  <span className="text-gray-400 text-xs">{TIMEZONES.find(tz => tz.value === p.timezone)?.label} · {fmt(p.workStart)}-{fmt(p.workEnd)}</span>
                  <button onClick={() => handleRemove(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3">
              <div>
                <label className="text-xs text-gray-400 mr-2">{t('duration')}</label>
                <select className={inputCls} value={duration} onChange={e => setDuration(Number(e.target.value))}>
                  {[30, 60, 90, 120].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <button onClick={findSlots} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors">
                <CalendarRange className="w-4 h-4" />{t('findSlots')}
              </button>
              <button onClick={() => { setParticipants([]); setSlots(null) }} className="text-gray-400 hover:text-gray-600"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Results */}
        {slots !== null && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{t('bestSlots')}</h2>
            {slots.length === 0 ? (
              <p className="text-sm text-gray-400">{t('noSlots')}</p>
            ) : (
              <ul className="space-y-3">
                {slots.slice(0, 8).map((slot, i) => (
                  <li key={i} className="border border-gray-100 dark:border-gray-700 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-indigo-600">{t('allAvailable')} · UTC {fmt(slot.utcHour)}</span>
                      <button onClick={() => handleCopy(slot, i)} className="text-gray-400 hover:text-indigo-600">
                        {copied === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <ul className="space-y-0.5">
                      {slot.times.map(t => (
                        <li key={t.name} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">{t.name}</span>
                          <span className="font-mono text-gray-700 dark:text-gray-200">{t.local}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
