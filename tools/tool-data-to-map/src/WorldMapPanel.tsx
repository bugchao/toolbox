import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { Maximize, Minimize, Trash2, Upload, Download, Settings2, ImageDown } from 'lucide-react'
import { Button, Card, NoticeCard, Switch } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import worldTemplateUrl from './assets/world-template.csv?url'
import { ColorLevelRow, LevelNumberInput } from './ColorLevelRow'
import { downloadBlob, downloadDataUrl } from './lib/download'
import { useFullscreen } from './lib/useFullscreen'
import { useLocalStorageState } from './lib/useLocalStorageState'
import { parseRegionFile, RegionParseError, type RegionData } from './lib/regionData'
import { getStandardWorldRegionName, getAllWorldCountryNames } from './lib/worldRegionNames'

interface RangeConfig {
  level2: number // 50-100 上界
  level1: number // 30-50 上界
  level0: number // 9-30 上界
  levelMinus1: number // 0 上界
  levelMinus2: number // 1-8 下界
  levelMinus3: number // 1-8 上界
  levelMinus4: number // 9-30 下界
  color2: string
  color1: string
  color0: string
  colorMinus1: string
  colorMinus2: string
  colorMinus3: string
}

const PRESET_1 = {
  color2: '#DCFCE7',
  colorMinus1: '#F0F6FF',
  colorMinus2: '#6FA3FF',
  colorMinus3: '#3F82FF',
  color0: '#005DE9',
  color1: '#2563EB',
}

const PRESET_2 = {
  color2: '#E6F4F1',
  color1: '#EEF2F7',
  color0: '#F1E7E3',
  colorMinus1: '#F3F4F6',
  colorMinus2: '#F1E7E3',
  colorMinus3: '#E5E7EB',
}

const PRESET_3 = {
  colorMinus1: '#F0F6FF',
  colorMinus2: '#6FA3FF',
  colorMinus3: '#3F82FF',
  color0: '#005DE9',
  color1: '#2563EB',
}

const DEFAULT_CONFIG: RangeConfig = {
  level2: 50,
  level1: 30,
  level0: 30,
  levelMinus1: 1,
  levelMinus2: 1,
  levelMinus3: 8,
  levelMinus4: 9,
  color2: '#0EA5A4',
  colorMinus1: '#F0F6FF',
  colorMinus2: '#6FA3FF',
  colorMinus3: '#3F82FF',
  color0: '#005DE9',
  color1: '#2563EB',
}

const WorldMapPanel: React.FC = () => {
  const { t } = useTranslation('toolDataToMap')
  const [mapData, setMapData] = useLocalStorageState<RegionData[]>('toolDataToMap.world.data', [])
  const [rangeConfig, setRangeConfig] = useLocalStorageState<RangeConfig>('toolDataToMap.world.config', DEFAULT_CONFIG)
  const [showLabels, setShowLabels] = useLocalStorageState<boolean>('toolDataToMap.world.showLabels', false)
  const [error, setError] = useState('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [exportWidth, setExportWidth] = useState(3840)
  const [exportHeight, setExportHeight] = useState(2160)
  const chartRef = useRef<ReactECharts>(null)
  const chartWrapperRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const worldGeoRef = useRef<unknown>(null)
  const [isFullscreen, toggleFullscreen] = useFullscreen(mapContainerRef)

  useEffect(() => {
    // 全屏切换后容器尺寸变化，等布局稳定再让 echarts 重新计算大小
    const timer = setTimeout(() => chartRef.current?.getEchartsInstance().resize(), 100)
    return () => clearTimeout(timer)
  }, [isFullscreen])

  const registerMap = useCallback(async () => {
    if (echarts.getMap('world')) {
      setMapLoaded(true)
      return
    }
    setLoading(true)
    setError('')
    try {
      const worldMapData = (await import('./assets/world.json')).default
      worldGeoRef.current = worldMapData
      echarts.registerMap('world', worldMapData as Parameters<typeof echarts.registerMap>[1])
      setMapLoaded(true)
    } catch (err) {
      console.error(err)
      setError(t('common.errors.mapLoadFailed'))
      setMapLoaded(false)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    registerMap()
  }, [registerMap])

  const clearMapData = useCallback(() => {
    if (window.confirm(t('common.clearConfirm'))) {
      setMapData([])
    }
  }, [setMapData, t])

  const downloadTemplate = useCallback(async () => {
    try {
      const response = await fetch(worldTemplateUrl)
      if (!response.ok) throw new Error('template fetch failed')
      const csvContent = await response.text()
      downloadBlob(new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' }), 'world-template.csv')
    } catch (err) {
      console.error(err)
      setError(t('common.errors.downloadTemplate'))
    }
  }, [t])

  const downloadMapPng = useCallback(async () => {
    const chart = chartRef.current?.getEchartsInstance()
    const wrapper = chartWrapperRef.current
    if (!chart || !wrapper) {
      setError(t('world.errorChartNotReady'))
      return
    }
    if (mapData.length === 0) {
      setError(t('world.errorNoDataForExport'))
      return
    }
    const w = Math.max(100, Math.min(8192, exportWidth))
    const h = Math.max(100, Math.min(8192, exportHeight))
    const prev = { width: wrapper.style.width, height: wrapper.style.height, position: wrapper.style.position, left: wrapper.style.left, zIndex: wrapper.style.zIndex }
    try {
      wrapper.style.position = 'fixed'
      wrapper.style.left = '-9999px'
      wrapper.style.top = '0'
      wrapper.style.width = `${w}px`
      wrapper.style.height = `${h}px`
      wrapper.style.zIndex = '-1'
      chart.resize()
      await new Promise((resolve) => setTimeout(resolve, 200))
      const url = chart.getDataURL({ type: 'png', pixelRatio: 1 })
      downloadDataUrl(url, `world-map_${w}x${h}_${new Date().toISOString().slice(0, 10)}.png`)
      setError('')
    } catch (err) {
      console.error(err)
      setError(t('common.errors.downloadFailed'))
    } finally {
      wrapper.style.position = prev.position
      wrapper.style.left = prev.left
      wrapper.style.zIndex = prev.zIndex
      wrapper.style.width = prev.width
      wrapper.style.height = prev.height
      chart.resize()
    }
  }, [mapData.length, exportWidth, exportHeight, t])

  const resetConfig = useCallback(() => {
    if (window.confirm(t('common.resetConfirm'))) {
      setRangeConfig(DEFAULT_CONFIG)
    }
  }, [setRangeConfig, t])

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      setError('')
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const content = reader.result as string
          const data = parseRegionFile(content, file.name, getStandardWorldRegionName)

          if (!worldGeoRef.current) {
            worldGeoRef.current = (await import('./assets/world.json')).default
          }
          const allNames = getAllWorldCountryNames(worldGeoRef.current)
          const valueByCountry = new Map(data.map((d) => [d.name, d.value]))
          const merged: RegionData[] = allNames.map((name) => ({ name, value: valueByCountry.get(name) ?? 0 }))
          setMapData(merged)
          await registerMap()
        } catch (err) {
          if (err instanceof RegionParseError) {
            setError(t(`common.errors.${err.code}`))
          } else {
            setError(err instanceof Error ? err.message : t('common.errors.noData'))
          }
          setMapData([])
        }
      }
      reader.onerror = () => {
        setError(t('common.errors.fileRead'))
        setMapData([])
      }
      reader.readAsText(file)
    },
    [registerMap, setMapData, t]
  )

  const getOption = () => {
    if (mapData.length === 0) {
      return { backgroundColor: '#ffffff', title: { text: t('common.placeholderUpload'), left: 'center', top: 'middle', textStyle: { color: '#999', fontSize: 20 } } }
    }
    if (!mapLoaded && loading) {
      return { backgroundColor: '#ffffff', title: { text: t('common.loadingMap'), left: 'center', top: 'middle', textStyle: { color: '#999', fontSize: 20 } } }
    }
    if (!mapLoaded) {
      return { backgroundColor: '#ffffff', title: { text: t('common.errors.mapLoadFailed'), left: 'center', top: 'middle', textStyle: { color: '#f44336', fontSize: 18 } } }
    }

    const c = { ...DEFAULT_CONFIG, ...rangeConfig }

    return {
      backgroundColor: '#ffffff',
      title: { text: t('world.mapTitle'), left: 'center', top: '10', textStyle: { color: '#333', fontSize: 20 } },
      tooltip: {
        trigger: 'item',
        formatter: (params: { name: string; value?: number }) => {
          const value = params.value ?? 0
          return `${params.name}<br/>${t('common.tooltipValue', { value: typeof value === 'number' ? value.toFixed(2) : value })}`
        },
      },
      visualMap: {
        type: 'piecewise',
        pieces: [
          { min: c.level1, max: c.level2, label: `${c.level1}-${c.level2}`, color: c.color1 },
          { min: c.level0, max: c.level1, label: `${c.level0}-${c.level1}`, color: c.color0 },
          { min: c.levelMinus4, max: c.level0, label: `${c.levelMinus4}-${c.level0}`, color: c.colorMinus3 },
          { min: c.levelMinus2, max: c.levelMinus3, label: `${c.levelMinus2}-${c.levelMinus3}`, color: c.colorMinus2 },
          { min: 0, max: 0, label: `${c.levelMinus1}`, color: c.colorMinus1 },
        ],
        left: 'left',
        top: 'bottom',
        orient: 'vertical',
        itemWidth: 20,
        itemHeight: 14,
        textStyle: { color: '#333' },
      },
      series: [
        {
          name: t('world.mapTitle'),
          type: 'map',
          map: 'world',
          roam: true,
          label: { show: showLabels, fontSize: 10, color: '#333', hideOverlap: true },
          emphasis: { label: { show: true, fontSize: 11, fontWeight: 'bold' } },
          data: mapData,
        },
      ],
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer">
            <input type="file" accept=".json,.csv" onChange={handleFileUpload} className="hidden" />
            <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
              <Upload className="h-4 w-4" />
              {t('common.uploadLabel')}
            </span>
          </label>
          <Button variant="secondary" onClick={downloadTemplate}>
            <span className="inline-flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              {t('common.downloadTemplate')}
            </span>
          </Button>
          {mapData.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span>{t('common.dataLoaded', { count: mapData.length })}</span>
              <Button variant="ghost" onClick={clearMapData}>
                <span className="inline-flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  {t('common.clearData')}
                </span>
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4">
            <NoticeCard tone="danger" title={error} />
          </div>
        )}

        <div className="mt-4">
          <Switch checked={showLabels} onChange={setShowLabels} label={t('common.showLabels')} />
        </div>

        <div className="mt-4">
          <Button variant="secondary" onClick={() => setShowConfig((v) => !v)}>
            <span className="inline-flex items-center gap-1.5">
              <Settings2 className="h-4 w-4" />
              {showConfig ? t('common.configHide') : t('common.configShow')}
            </span>
          </Button>

          {showConfig && (
            <div className="mt-4 space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('world.configTitle')}</h3>
                <Button variant="ghost" onClick={resetConfig}>
                  {t('common.resetConfig')}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">{t('common.presetLabel')}</span>
                <Button variant="secondary" onClick={() => setRangeConfig({ ...rangeConfig, ...PRESET_1 })}>
                  {t('common.preset1')}
                </Button>
                <Button variant="secondary" onClick={() => setRangeConfig({ ...rangeConfig, ...PRESET_2 })}>
                  {t('common.preset2')}
                </Button>
                <Button variant="secondary" onClick={() => setRangeConfig({ ...rangeConfig, ...PRESET_3 })}>
                  {t('common.preset3')}
                </Button>
              </div>

              <div className="space-y-2">
                <ColorLevelRow label={t('world.level1')} color={rangeConfig.color1} onColorChange={(color) => setRangeConfig({ ...rangeConfig, color1: color })}>
                  <LevelNumberInput value={rangeConfig.level1} onChange={(v) => setRangeConfig({ ...rangeConfig, level1: v })} />
                </ColorLevelRow>
                <ColorLevelRow label={t('world.level0')} color={rangeConfig.colorMinus3} onColorChange={(color) => setRangeConfig({ ...rangeConfig, colorMinus3: color })}>
                  <LevelNumberInput title={t('world.lowerBound')} value={rangeConfig.levelMinus4} onChange={(v) => setRangeConfig({ ...rangeConfig, levelMinus4: v })} />
                  <span className="text-gray-400">-</span>
                  <LevelNumberInput title={t('world.upperBound')} value={rangeConfig.level0} onChange={(v) => setRangeConfig({ ...rangeConfig, level0: v })} />
                </ColorLevelRow>
                <ColorLevelRow label={t('world.levelMinus2')} color={rangeConfig.colorMinus2} onColorChange={(color) => setRangeConfig({ ...rangeConfig, colorMinus2: color })}>
                  <LevelNumberInput title={t('world.lowerBound')} value={rangeConfig.levelMinus2} onChange={(v) => setRangeConfig({ ...rangeConfig, levelMinus2: v })} />
                  <span className="text-gray-400">-</span>
                  <LevelNumberInput title={t('world.upperBound')} value={rangeConfig.levelMinus3} onChange={(v) => setRangeConfig({ ...rangeConfig, levelMinus3: v })} />
                </ColorLevelRow>
                <ColorLevelRow label={t('world.levelMinus1')} color={rangeConfig.colorMinus1} onColorChange={(color) => setRangeConfig({ ...rangeConfig, colorMinus1: color })}>
                  <LevelNumberInput value={rangeConfig.levelMinus1} onChange={(v) => setRangeConfig({ ...rangeConfig, levelMinus1: v })} />
                </ColorLevelRow>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('world.configNote')}</p>
            </div>
          )}
        </div>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <div
          ref={mapContainerRef}
          className={`bg-white dark:bg-gray-900 ${isFullscreen ? 'flex h-full w-full flex-col' : ''}`}
        >
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-b border-gray-200 p-2 dark:border-gray-700">
            <Button variant="ghost" onClick={toggleFullscreen}>
              <span className="inline-flex items-center gap-1.5">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                {isFullscreen ? t('common.fullscreenExit') : t('common.fullscreenEnter')}
              </span>
            </Button>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('world.exportSizeLabel')}</span>
            <Button variant="secondary" onClick={() => { setExportWidth(1920); setExportHeight(1080) }}>
              1080p
            </Button>
            <Button variant="secondary" onClick={() => { setExportWidth(3840); setExportHeight(2160) }}>
              4K
            </Button>
            <input
              type="number"
              min={100}
              max={8192}
              value={exportWidth}
              onChange={(e) => setExportWidth(Number(e.target.value) || 3840)}
              className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
            <span className="text-gray-400">×</span>
            <input
              type="number"
              min={100}
              max={8192}
              value={exportHeight}
              onChange={(e) => setExportHeight(Number(e.target.value) || 2160)}
              className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
            <Button variant="secondary" onClick={downloadMapPng}>
              <span className="inline-flex items-center gap-1.5">
                <ImageDown className="h-4 w-4" />
                {t('world.downloadPng')}
              </span>
            </Button>
          </div>
          <div ref={chartWrapperRef} className={`w-full p-2 ${isFullscreen ? 'flex-1' : 'h-[560px]'}`}>
            <ReactECharts ref={chartRef} option={getOption()} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
        </div>
      </Card>

      {mapData.length > 0 && (
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-100">{t('common.dataPreviewTitle')}</h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/70">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('common.tableHeaderName')}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('common.tableHeaderValue')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mapData.map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{item.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="number"
                          step="3"
                          min="0"
                          value={item.value}
                          onChange={(e) => {
                            const newData = [...mapData]
                            newData[index] = { ...newData[index], value: Number(e.target.value) }
                            setMapData(newData)
                          }}
                          className="w-28 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default WorldMapPanel
