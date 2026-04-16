import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock } from 'lucide-react'

interface TimezoneOption {
  value: string
  labelKey: string
}

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'UTC', labelKey: 'timezoneOptions.utc' },
  { value: 'America/New_York', labelKey: 'timezoneOptions.newYork' },
  { value: 'America/Los_Angeles', labelKey: 'timezoneOptions.losAngeles' },
  { value: 'Europe/London', labelKey: 'timezoneOptions.london' },
  { value: 'Europe/Paris', labelKey: 'timezoneOptions.paris' },
  { value: 'Asia/Tokyo', labelKey: 'timezoneOptions.tokyo' },
  { value: 'Asia/Shanghai', labelKey: 'timezoneOptions.shanghai' },
  { value: 'Asia/Singapore', labelKey: 'timezoneOptions.singapore' },
  { value: 'Australia/Sydney', labelKey: 'timezoneOptions.sydney' },
]

const TimezoneConverter: React.FC = () => {
  const { t, i18n } = useTranslation('toolTimezoneConverter')
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(['UTC', 'Asia/Shanghai'])
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [meetingTime, setMeetingTime] = useState<string>('')

  const locale = useMemo(
    () => ((i18n.resolvedLanguage || i18n.language).startsWith('zh') ? 'zh-CN' : 'en-US'),
    [i18n.language, i18n.resolvedLanguage]
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getTimezoneLabel = (timezone: string) => {
    const option = TIMEZONE_OPTIONS.find((item) => item.value === timezone)
    return option ? t(option.labelKey) : timezone
  }

  const addTimezone = () => {
    if (selectedTimezones.length >= 5) return

    const available = TIMEZONE_OPTIONS.map((tz) => tz.value).filter((tz) => !selectedTimezones.includes(tz))
    if (available.length > 0) {
      setSelectedTimezones((prev) => [...prev, available[0]])
    }
  }

  const removeTimezone = (timezone: string) => {
    if (selectedTimezones.length <= 1) return
    setSelectedTimezones((prev) => prev.filter((tz) => tz !== timezone))
  }

  const formatTimeForTimezone = (date: Date, timezone: string): string => {
    try {
      return date.toLocaleString(locale, {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    } catch {
      return t('invalidTimezone')
    }
  }

  const convertMeetingTime = (): Date | null => {
    if (!meetingTime) return null

    const [datePart, timePart] = meetingTime.split('T')
    if (!datePart || !timePart) return null

    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)

    return new Date(year, month - 1, day, hour, minute)
  }

  const meetingDate = convertMeetingTime()

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-center text-3xl font-bold">🌍 {t('title')}</h1>
      <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">{t('description')}</p>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 flex items-center text-xl font-semibold">
          <Clock className="mr-2" size={20} />
          {t('currentTimeTitle')}
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t('currentTimeDescription')}</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {selectedTimezones.map((tz) => (
            <div key={tz} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="font-medium">{getTimezoneLabel(tz)}</h3>
                <button
                  onClick={() => removeTimezone(tz)}
                  className="text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={selectedTimezones.length <= 1}
                  aria-label={t('removeTimezone')}
                  title={t('removeTimezone')}
                >
                  ×
                </button>
              </div>
              <p className="text-lg font-mono">{formatTimeForTimezone(currentTime, tz)}</p>
            </div>
          ))}
        </div>

        {selectedTimezones.length < 5 && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={addTimezone}
              className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              {t('addTimezone')}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('compareLimit')}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 flex items-center text-xl font-semibold">
          <Calendar className="mr-2" size={20} />
          {t('meetingTitle')}
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t('meetingDescription')}</p>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">{t('meetingLabel')}</label>
          <input
            type="datetime-local"
            value={meetingTime}
            onChange={(event) => setMeetingTime(event.target.value)}
            className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        {meetingDate ? (
          <div className="mt-4">
            <h3 className="mb-2 font-medium">{t('meetingResults')}</h3>
            <div className="space-y-2">
              {selectedTimezones.map((tz) => (
                <div
                  key={`meeting-${tz}`}
                  className="flex items-center justify-between gap-4 rounded bg-gray-50 p-2 dark:bg-gray-700"
                >
                  <span>{getTimezoneLabel(tz)}</span>
                  <span className="font-mono">{formatTimeForTimezone(meetingDate, tz)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('meetingPlaceholder')}</p>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>{t('footerNote')}</p>
      </div>
    </div>
  )
}

export default TimezoneConverter
