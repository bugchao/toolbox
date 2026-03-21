import React, { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Cloud,
  CloudRain,
  Compass,
  Droplets,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  Input,
  NoticeCard,
  PageHero,
} from '@toolbox/ui-kit'

type RangeMode = '7d' | '30d' | 'custom'

interface WeatherLocation {
  name: string
  displayName: string
  latitude: number
  longitude: number
  timezone: string
  source: 'ip' | 'search'
}

interface CurrentWeatherSnapshot {
  temperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  time: string
}

interface DailyWeatherRow {
  date: string
  high: number
  low: number
  weatherCode: number
  precipitation: number
  windSpeed: number
}

interface GeocodeResult {
  name: string
  admin1?: string
  country?: string
  latitude: number
  longitude: number
  timezone?: string
  population?: number
  feature_code?: string
}

interface IpOpsGeoPayload {
  ip: string
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  timezone?: string
  error?: string
}

const WEATHER_CODE_META: Record<number, { zh: string; en: string; icon: string }> = {
  0: { zh: '晴朗', en: 'Clear', icon: '☀️' },
  1: { zh: '大部晴朗', en: 'Mostly clear', icon: '🌤️' },
  2: { zh: '局部多云', en: 'Partly cloudy', icon: '⛅' },
  3: { zh: '阴天', en: 'Overcast', icon: '☁️' },
  45: { zh: '雾', en: 'Fog', icon: '🌫️' },
  48: { zh: '冻雾', en: 'Depositing rime fog', icon: '🌫️' },
  51: { zh: '小毛毛雨', en: 'Light drizzle', icon: '🌦️' },
  53: { zh: '中毛毛雨', en: 'Moderate drizzle', icon: '🌦️' },
  55: { zh: '大毛毛雨', en: 'Dense drizzle', icon: '🌧️' },
  56: { zh: '小冻雨', en: 'Light freezing drizzle', icon: '🌧️' },
  57: { zh: '大冻雨', en: 'Dense freezing drizzle', icon: '🌧️' },
  61: { zh: '小雨', en: 'Slight rain', icon: '🌧️' },
  63: { zh: '中雨', en: 'Moderate rain', icon: '🌧️' },
  65: { zh: '大雨', en: 'Heavy rain', icon: '🌧️' },
  66: { zh: '小冻雨', en: 'Light freezing rain', icon: '🌧️' },
  67: { zh: '大冻雨', en: 'Heavy freezing rain', icon: '🌧️' },
  71: { zh: '小雪', en: 'Slight snow', icon: '❄️' },
  73: { zh: '中雪', en: 'Moderate snow', icon: '❄️' },
  75: { zh: '大雪', en: 'Heavy snow', icon: '❄️' },
  77: { zh: '冰粒', en: 'Snow grains', icon: '❄️' },
  80: { zh: '小阵雨', en: 'Slight showers', icon: '🌦️' },
  81: { zh: '中阵雨', en: 'Moderate showers', icon: '🌧️' },
  82: { zh: '强阵雨', en: 'Violent showers', icon: '⛈️' },
  85: { zh: '小阵雪', en: 'Slight snow showers', icon: '🌨️' },
  86: { zh: '强阵雪', en: 'Heavy snow showers', icon: '🌨️' },
  95: { zh: '雷暴', en: 'Thunderstorm', icon: '⛈️' },
  96: { zh: '雷暴伴小冰雹', en: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { zh: '雷暴伴大冰雹', en: 'Thunderstorm with heavy hail', icon: '⛈️' },
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function diffDaysInclusive(start: string, end: string) {
  const startDate = parseDate(start)
  const endDate = parseDate(end)
  const diff = endDate.getTime() - startDate.getTime()
  return Math.floor(diff / 86400000) + 1
}

function shiftDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function getPresetRange(mode: Exclude<RangeMode, 'custom'>) {
  const today = new Date()
  if (mode === '7d') {
    return {
      start: toDateInputValue(shiftDays(today, -6)),
      end: toDateInputValue(today),
    }
  }

  return {
    start: toDateInputValue(shiftDays(today, -29)),
    end: toDateInputValue(today),
  }
}

function getWeatherMeta(code: number, lang: string) {
  const meta = WEATHER_CODE_META[code] || {
    zh: '未知',
    en: 'Unknown',
    icon: '🌤️',
  }

  return {
    icon: meta.icon,
    label: lang.startsWith('zh') ? meta.zh : meta.en,
  }
}

function normalizeLocationTerm(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/特别行政区|壮族自治区|回族自治区|维吾尔自治区|自治区|省|市/g, '')
    .replace(/[\s,.'-]/g, '')
}

function buildDisplayName(parts: Array<string | undefined>) {
  const seen = new Set<string>()

  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .filter((part) => {
      const normalized = normalizeLocationTerm(part)
      if (seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
    .join(', ')
}

function scoreGeocodeResult(result: GeocodeResult, query: string) {
  const normalizedQuery = normalizeLocationTerm(query)
  const normalizedName = normalizeLocationTerm(result.name || '')
  const normalizedAdmin = normalizeLocationTerm(result.admin1 || '')
  const featureCode = result.feature_code || ''
  let score = 0

  if (normalizedName === normalizedQuery) score += 3000
  if (normalizedName.startsWith(normalizedQuery)) score += 1200
  if (normalizedAdmin === normalizedQuery) score += 500
  if (featureCode === 'PPLC') score += 900
  if (featureCode.startsWith('PPLA')) score += 700
  if (featureCode === 'PPL') score += 300
  score += Math.min(result.population || 0, 50000000) / 100000

  return score
}

async function readJson(response: Response) {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed with ${response.status}`)
  }
  return data
}

async function fetchIpLocationFromApi() {
  const publicData = await readJson(await fetch('/api/ip-ops/public'))
  const geoData = await readJson(
    await fetch('/api/ip-ops/geo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: publicData.ip }),
    })
  ) as IpOpsGeoPayload

  if (typeof geoData.latitude !== 'number' || typeof geoData.longitude !== 'number') {
    throw new Error(geoData.error || 'Unable to resolve location from IP')
  }

  return {
    name: geoData.city || geoData.country || 'Current location',
    displayName: buildDisplayName([geoData.city, geoData.region, geoData.country]),
    latitude: geoData.latitude,
    longitude: geoData.longitude,
    timezone: geoData.timezone || 'auto',
    source: 'ip',
  } satisfies WeatherLocation
}

async function fetchIpLocation(lang: string) {
  try {
    return await fetchIpLocationFromApi()
  } catch {
    throw new Error(lang.startsWith('zh') ? 'IP 定位失败' : 'IP lookup failed')
  }
}

async function geocodeCity(query: string, lang: string) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=${lang.startsWith('zh') ? 'zh' : 'en'}&format=json`
  )

  if (!response.ok) {
    throw new Error(lang.startsWith('zh') ? '城市搜索失败' : 'Location search failed')
  }

  const data = await response.json()
  const candidates = (data.results || []) as GeocodeResult[]
  const result = candidates.sort((left, right) => scoreGeocodeResult(right, query) - scoreGeocodeResult(left, query))[0]
  if (!result) {
    throw new Error(lang.startsWith('zh') ? '未找到匹配城市' : 'No matching location found')
  }

  const parts = buildDisplayName([result.name, result.admin1, result.country])

  return {
    name: result.name,
    displayName: parts,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone || 'auto',
    source: 'search',
  } satisfies WeatherLocation
}

async function fetchCurrentWeather(location: WeatherLocation) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=${encodeURIComponent(location.timezone)}`
  )

  if (!response.ok) throw new Error('Failed to load current weather')

  const data = await response.json()
  return {
    temperature: Math.round(data.current.temperature_2m),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    weatherCode: data.current.weather_code,
    time: data.current.time,
  } satisfies CurrentWeatherSnapshot
}

async function fetchDailyWeather(location: WeatherLocation, startDate: string, endDate: string) {
  const today = toDateInputValue(new Date())
  const yesterday = toDateInputValue(shiftDays(new Date(), -1))
  const rows = new Map<string, DailyWeatherRow>()

  async function fetchSegment(endpoint: string, start: string, end: string) {
    const response = await fetch(
      `${endpoint}?latitude=${location.latitude}&longitude=${location.longitude}&start_date=${start}&end_date=${end}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=${encodeURIComponent(location.timezone)}`
    )
    if (!response.ok) throw new Error('Failed to load weather range')
    const data = await response.json()
    const times = data.daily?.time || []

    times.forEach((date: string, index: number) => {
      rows.set(date, {
        date,
        high: Math.round(data.daily.temperature_2m_max[index]),
        low: Math.round(data.daily.temperature_2m_min[index]),
        weatherCode: data.daily.weather_code[index],
        precipitation: Number(data.daily.precipitation_sum[index] || 0),
        windSpeed: Math.round(data.daily.wind_speed_10m_max[index] || 0),
      })
    })
  }

  if (startDate <= yesterday) {
    const pastEnd = endDate < today ? endDate : yesterday
    await fetchSegment('https://archive-api.open-meteo.com/v1/archive', startDate, pastEnd)
  }

  if (endDate >= today) {
    const futureStart = startDate > today ? startDate : today
    await fetchSegment('https://api.open-meteo.com/v1/forecast', futureStart, endDate)
  }

  return Array.from(rows.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export default function WeatherTool() {
  const { t, i18n } = useTranslation('toolWeather')
  const lang = i18n.language
  const preset7d = getPresetRange('7d')
  const [query, setQuery] = useState('')
  const [rangeMode, setRangeMode] = useState<RangeMode>('7d')
  const [startDate, setStartDate] = useState(preset7d.start)
  const [endDate, setEndDate] = useState(preset7d.end)
  const [location, setLocation] = useState<WeatherLocation | null>(null)
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherSnapshot | null>(null)
  const [dailyWeather, setDailyWeather] = useState<DailyWeatherRow[]>([])
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(true)
  const [error, setError] = useState('')

  const maxCustomEndDate = useMemo(() => toDateInputValue(shiftDays(new Date(), 15)), [])

  const summary = useMemo(() => {
    if (!dailyWeather.length) return null
    const totalHigh = dailyWeather.reduce((sum, item) => sum + item.high, 0)
    const totalLow = dailyWeather.reduce((sum, item) => sum + item.low, 0)
    const totalPrecipitation = dailyWeather.reduce((sum, item) => sum + item.precipitation, 0)
    const peakWind = dailyWeather.reduce((max, item) => Math.max(max, item.windSpeed), 0)
    return {
      averageHigh: Math.round(totalHigh / dailyWeather.length),
      averageLow: Math.round(totalLow / dailyWeather.length),
      totalPrecipitation: Math.round(totalPrecipitation * 10) / 10,
      peakWind,
    }
  }, [dailyWeather])

  const formatDay = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(lang.startsWith('zh') ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })

  const validateRange = (nextStart: string, nextEnd: string) => {
    if (!nextStart || !nextEnd) throw new Error(t('errors.missingDate'))
    if (nextStart > nextEnd) throw new Error(t('errors.invalidRange'))
    if (diffDaysInclusive(nextStart, nextEnd) > 31) throw new Error(t('errors.tooLong'))
    if (parseDate(nextEnd).getTime() > parseDate(maxCustomEndDate).getTime()) {
      throw new Error(t('errors.futureLimit', { date: maxCustomEndDate }))
    }
  }

  const loadWeather = async (nextLocation: WeatherLocation, nextStart: string, nextEnd: string) => {
    validateRange(nextStart, nextEnd)
    setLoading(true)
    setError('')
    try {
      const [current, daily] = await Promise.all([
        fetchCurrentWeather(nextLocation),
        fetchDailyWeather(nextLocation, nextStart, nextEnd),
      ])
      setLocation(nextLocation)
      setCurrentWeather(current)
      setDailyWeather(daily)
      setQuery(nextLocation.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
      setLocating(false)
    }
  }

  useEffect(() => {
    async function bootstrap() {
      setLocating(true)
      setError('')
      try {
        const currentLocation = await fetchIpLocation(lang)
        await loadWeather(currentLocation, preset7d.start, preset7d.end)
      } catch {
        setLocating(false)
        setError(t('errors.ipLocateFallback'))
      }
    }
    void bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    try {
      const nextLocation = await geocodeCity(query.trim(), lang)
      await loadWeather(nextLocation, startDate, endDate)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  const handleLocateCurrent = async () => {
    setLocating(true)
    setError('')
    try {
      const nextLocation = await fetchIpLocation(lang)
      await loadWeather(nextLocation, startDate, endDate)
    } catch (err) {
      setLocating(false)
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  const applyPreset = async (mode: Exclude<RangeMode, 'custom'>) => {
    const range = getPresetRange(mode)
    setRangeMode(mode)
    setStartDate(range.start)
    setEndDate(range.end)
    if (location) await loadWeather(location, range.start, range.end)
  }

  const applyCustomRange = async () => {
    setRangeMode('custom')
    if (!location) {
      setError(t('errors.locationRequired'))
      return
    }
    await loadWeather(location, startDate, endDate)
  }

  const heroDescription = location ? t('locationResolved', { location: location.displayName }) : t('locationPending')
  const observedAt = currentWeather
    ? new Date(currentWeather.time).toLocaleString(lang.startsWith('zh') ? 'zh-CN' : 'en-US')
    : ''

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-sky-200/80 bg-gradient-to-br from-sky-100 via-white to-cyan-100 dark:border-slate-700/80 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/40">
        <div className="relative py-2">
          <PageHero icon={Cloud} title={t('title')} description={heroDescription} />
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('searchLabel')}</div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleSearch()
                }}
                placeholder={t('searchPlaceholder')}
              />
              <Button
                onClick={() => void handleSearch()}
                disabled={!query.trim() || loading}
                className="w-full shrink-0 whitespace-nowrap sm:w-auto sm:min-w-[132px]"
              >
                <Search className="mr-2 h-4 w-4" />
                {loading ? t('searching') : t('searchAction')}
              </Button>
            </div>
          </label>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => void handleLocateCurrent()}
              disabled={locating || loading}
              className="w-full shrink-0 whitespace-nowrap sm:w-auto sm:min-w-[148px]"
            >
              {locating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Compass className="mr-2 h-4 w-4" />}
              {locating ? t('locating') : t('useIpLocation')}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <MapPin className="h-4 w-4" />
          <span>{heroDescription}</span>
          {location?.source === 'ip' ? (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
              {t('ipBadge')}
            </span>
          ) : null}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {(['7d', '30d', 'custom'] as RangeMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                if (mode === 'custom') {
                  setRangeMode('custom')
                  return
                }
                void applyPreset(mode)
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                rangeMode === mode
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {mode === '7d' ? t('presets.last7d') : mode === '30d' ? t('presets.last30d') : t('presets.custom')}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('startDate')}</div>
            <Input type="date" value={startDate} max={maxCustomEndDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('endDate')}</div>
            <Input type="date" value={endDate} max={maxCustomEndDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => void applyCustomRange()}
              disabled={loading}
              className="w-full shrink-0 whitespace-nowrap md:w-auto md:min-w-[160px]"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {t('applyRange')}
            </Button>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">{t('rangeHint', { date: maxCustomEndDate })}</p>
      </Card>

      {error ? <NoticeCard tone="danger" title={error} /> : null}

      {currentWeather && location ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card className="bg-gradient-to-br from-sky-600 via-cyan-600 to-indigo-700 text-white shadow-lg">
            <div className="space-y-6">
              <div className="min-w-0">
                <div className="text-sm uppercase tracking-[0.2em] text-white/70">{t('currentWeather')}</div>
                <h2 className="mt-2 max-w-[16ch] text-3xl font-bold leading-tight sm:text-4xl">{location.displayName}</h2>
                <div className="mt-4 flex flex-wrap items-end gap-4">
                  <div className="text-6xl">{getWeatherMeta(currentWeather.weatherCode, lang).icon}</div>
                  <div>
                    <div className="text-5xl font-bold">{currentWeather.temperature}°C</div>
                    <div className="mt-2 text-lg text-white/90">{getWeatherMeta(currentWeather.weatherCode, lang).label}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-slate-950/20 px-4 py-4 shadow-sm backdrop-blur-sm">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">{t('metrics.humidity')}</div>
                  <div className="mt-3 text-3xl font-semibold">{currentWeather.humidity}%</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-slate-950/20 px-4 py-4 shadow-sm backdrop-blur-sm">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">{t('metrics.wind')}</div>
                  <div className="mt-3 text-3xl font-semibold">{currentWeather.windSpeed} km/h</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-slate-950/20 px-4 py-4 shadow-sm backdrop-blur-sm">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">{t('metrics.observedAt')}</div>
                  <div className="mt-3 text-base font-semibold leading-7">{observedAt}</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('summary.averageHigh')}</div>
              <div className="mt-3 inline-flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                <Sun className="h-6 w-6 text-amber-500" />
                {summary?.averageHigh ?? '--'}°C
              </div>
            </Card>
            <Card>
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('summary.averageLow')}</div>
              <div className="mt-3 inline-flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                <Thermometer className="h-6 w-6 text-sky-500" />
                {summary?.averageLow ?? '--'}°C
              </div>
            </Card>
            <Card>
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('summary.totalPrecipitation')}</div>
              <div className="mt-3 inline-flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                <CloudRain className="h-6 w-6 text-cyan-500" />
                {summary?.totalPrecipitation ?? '--'} mm
              </div>
            </Card>
            <Card>
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('summary.peakWind')}</div>
              <div className="mt-3 inline-flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                <Wind className="h-6 w-6 text-violet-500" />
                {summary?.peakWind ?? '--'} km/h
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      <Card className="space-y-5">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('rangeResultTitle')}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('rangeResolved', { start: startDate, end: endDate, days: dailyWeather.length })}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dailyWeather.map((day) => {
            const meta = getWeatherMeta(day.weatherCode, lang)
            return (
              <Card key={day.date} className="border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{formatDay(day.date)}</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="text-3xl">{meta.icon}</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{meta.label}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{day.high}° / {day.low}°</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white px-3 py-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <div className="text-xs text-slate-400">{t('metrics.rainfall')}</div>
                    <div className="mt-1 font-semibold">{day.precipitation} mm</div>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <div className="text-xs text-slate-400">{t('metrics.wind')}</div>
                    <div className="mt-1 font-semibold">{day.windSpeed} km/h</div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {!dailyWeather.length && !loading ? (
          <NoticeCard tone="info" title={t('empty')} />
        ) : null}
      </Card>

      <Card className="space-y-3">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('notesTitle')}</div>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {[t('notes.note1'), t('notes.note2'), t('notes.note3'), t('notes.note4')].map((note) => (
            <li key={note} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/50">
              {note}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
