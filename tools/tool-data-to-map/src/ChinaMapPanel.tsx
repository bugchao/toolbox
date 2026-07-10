import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { Maximize, Minimize, Trash2, Upload, Download, Settings2 } from 'lucide-react'
import { Button, Card, NoticeCard, Switch } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import chinaTemplateUrl from './assets/china-template.csv?url'
import { ColorLevelRow, LevelNumberInput } from './ColorLevelRow'
import { downloadBlob } from './lib/download'
import { useFullscreen } from './lib/useFullscreen'
import { useLocalStorageState } from './lib/useLocalStorageState'
import { parseRegionFile, RegionParseError, type RegionData } from './lib/regionData'
import { getStandardChinaRegionName } from './lib/chinaRegionNames'

interface RangeConfig {
  level5: number
  level4: number
  level3: number
  level2: number
  level1: number
  level0: number
  levelMinus1: number
  color5: string
  color4: string
  color3: string
  color2: string
  color1: string
  color0: string
  colorMinus1: string
}

const PRESET_1 = {
  color5: '#FEE2E2',
  color4: '#FFEDD5',
  color3: '#FEF9C3',
  color2: '#DCFCE7',
  color1: '#CCFBF1',
  color0: '#DBEAFE',
  colorMinus1: '#E0F2FE',
}

const PRESET_2 = {
  color5: '#F3E8FF',
  color4: '#E0F2FE',
  color3: '#FFF3C4',
  color2: '#E6F4F1',
  color1: '#EEF2F7',
  color0: '#F1E7E3',
  colorMinus1: '#F3F4F6',
}

const PRESET_3 = {
  colorMinus1: '#F0F6FF',
  color0: '#E2EDFF',
  color1: '#C7DBFF',
  color2: '#9EC2FF',
  color3: '#6FA3FF',
  color4: '#3F82FF',
  color5: '#005DE9',
}

const DEFAULT_CONFIG: RangeConfig = {
  level5: 300,
  level4: 200,
  level3: 100,
  level2: 50,
  level1: 30,
  level0: 1,
  levelMinus1: 0,
  color5: '#F97316',
  color4: '#EAB308',
  color3: '#22C55E',
  color2: '#0EA5A4',
  color1: '#2563EB',
  color0: '#63E6BE',
  colorMinus1: '#eee',
}

const ChinaMapPanel: React.FC = () => {
  const { t } = useTranslation('toolDataToMap')
  const [mapData, setMapData] = useLocalStorageState<RegionData[]>('toolDataToMap.china.data', [])
  const [rangeConfig, setRangeConfig] = useLocalStorageState<RangeConfig>('toolDataToMap.china.config', DEFAULT_CONFIG)
  const [showLabels, setShowLabels] = useLocalStorageState<boolean>('toolDataToMap.china.showLabels', true)
  const [error, setError] = useState('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReactECharts>(null)
  const [isFullscreen, toggleFullscreen] = useFullscreen(mapContainerRef)

  useEffect(() => {
    // 全屏切换后容器尺寸变化，等布局稳定再让 echarts 重新计算大小
    const timer = setTimeout(() => chartRef.current?.getEchartsInstance().resize(), 100)
    return () => clearTimeout(timer)
  }, [isFullscreen])

  const registerMap = useCallback(async () => {
    if (echarts.getMap('china')) {
      setMapLoaded(true)
      return
    }
    setLoading(true)
    setError('')
    try {
      const chinaMapData = (await import('./assets/china.json')).default
      echarts.registerMap('china', chinaMapData as Parameters<typeof echarts.registerMap>[1])
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
      const response = await fetch(chinaTemplateUrl)
      if (!response.ok) throw new Error('template fetch failed')
      const csvContent = await response.text()
      downloadBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), 'china-template.csv')
    } catch (err) {
      console.error(err)
      setError(t('common.errors.downloadTemplate'))
    }
  }, [t])

  const resetConfig = useCallback(() => {
    if (window.confirm(t('common.resetConfirm'))) {
      setRangeConfig(DEFAULT_CONFIG)
    }
  }, [setRangeConfig, t])

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      setError('')
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const content = reader.result as string
          const data = parseRegionFile(content, file.name, getStandardChinaRegionName)
          setMapData(data)
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
      return { title: { text: t('common.placeholderUpload'), left: 'center', top: 'middle', textStyle: { color: '#999', fontSize: 20 } } }
    }
    if (!mapLoaded && loading) {
      return { title: { text: t('common.loadingMap'), left: 'center', top: 'middle', textStyle: { color: '#999', fontSize: 20 } } }
    }
    if (!mapLoaded) {
      return { title: { text: t('common.errors.mapLoadFailed'), left: 'center', top: 'middle', textStyle: { color: '#f44336', fontSize: 18 } } }
    }

    return {
      title: { text: t('china.mapTitle'), left: 'center', top: '10', textStyle: { color: '#333', fontSize: 20 } },
      tooltip: {
        trigger: 'item',
        formatter: (params: { name: string; value?: number }) => {
          const value = (params.value || 0) / 10000
          return `${params.name}<br/>${t('common.tooltipValue', { value: value.toFixed(2) })}`
        },
      },
      visualMap: {
        type: 'piecewise',
        pieces: [
          { min: rangeConfig.level5 * 10000, label: `${rangeConfig.level5}+`, color: rangeConfig.color5 },
          { min: rangeConfig.level4 * 10000, max: rangeConfig.level5 * 10000, label: `${rangeConfig.level4}-${rangeConfig.level5}`, color: rangeConfig.color4 },
          { min: rangeConfig.level3 * 10000, max: rangeConfig.level4 * 10000, label: `${rangeConfig.level3}-${rangeConfig.level4}`, color: rangeConfig.color3 },
          { min: rangeConfig.level2 * 10000, max: rangeConfig.level3 * 10000, label: `${rangeConfig.level2}-${rangeConfig.level3}`, color: rangeConfig.color2 },
          { min: rangeConfig.level1 * 10000, max: rangeConfig.level2 * 10000, label: `${rangeConfig.level1}-${rangeConfig.level2}`, color: rangeConfig.color1 },
          { min: rangeConfig.level0 * 10000, max: rangeConfig.level1 * 10000, label: `${rangeConfig.level0}-${rangeConfig.level1}`, color: rangeConfig.color0 },
          { min: 0, max: rangeConfig.level0 * 10000, label: `< ${rangeConfig.level0}`, color: rangeConfig.colorMinus1 },
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
          name: t('china.mapTitle'),
          type: 'map',
          map: 'china',
          roam: true,
          label: { show: showLabels, fontSize: 12, color: '#333' },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
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

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{t('china.nameHint1')}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('china.nameHint2')}</p>

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
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('china.configTitle')}</h3>
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
                <ColorLevelRow label={t('china.level5')} color={rangeConfig.color5} onColorChange={(color) => setRangeConfig({ ...rangeConfig, color5: color })}>
                  <LevelNumberInput value={rangeConfig.level5} onChange={(v) => setRangeConfig({ ...rangeConfig, level5: v })} />
                </ColorLevelRow>
                <ColorLevelRow label={t('china.level4')} color={rangeConfig.color4} onColorChange={(color) => setRangeConfig({ ...rangeConfig, color4: color })}>
                  <LevelNumberInput value={rangeConfig.level4} onChange={(v) => setRangeConfig({ ...rangeConfig, level4: v })} />
                </ColorLevelRow>
                <ColorLevelRow label={t('china.level3')} color={rangeConfig.color3} onColorChange={(color) => setRangeConfig({ ...rangeConfig, color3: color })}>
                  <LevelNumberInput value={rangeConfig.level3} onChange={(v) => setRangeConfig({ ...rangeConfig, level3: v })} />
                </ColorLevelRow>
                <ColorLevelRow label={t('china.level2')} color={rangeConfig.color2} onColorChange={(color) => setRangeConfig({ ...rangeConfig, color2: color })}>
                  <LevelNumberInput value={rangeConfig.level2} onChange={(v) => setRangeConfig({ ...rangeConfig, level2: v })} />
                </ColorLevelRow>
                <ColorLevelRow label={t('china.level1')} color={rangeConfig.color1} onColorChange={(color) => setRangeConfig({ ...rangeConfig, color1: color })}>
                  <LevelNumberInput value={rangeConfig.level1} onChange={(v) => setRangeConfig({ ...rangeConfig, level1: v })} />
                </ColorLevelRow>
                <ColorLevelRow label={t('china.level0')} color={rangeConfig.color0} onColorChange={(color) => setRangeConfig({ ...rangeConfig, color0: color })}>
                  <LevelNumberInput value={rangeConfig.level0} onChange={(v) => setRangeConfig({ ...rangeConfig, level0: v })} />
                </ColorLevelRow>
                <ColorLevelRow label={t('china.levelMinus1')} color={rangeConfig.colorMinus1} onColorChange={(color) => setRangeConfig({ ...rangeConfig, colorMinus1: color })}>
                  <LevelNumberInput value={rangeConfig.levelMinus1} onChange={(v) => setRangeConfig({ ...rangeConfig, levelMinus1: v })} />
                </ColorLevelRow>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('china.configNote')}</p>
            </div>
          )}
        </div>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <div
          ref={mapContainerRef}
          className={`bg-white dark:bg-gray-900 ${isFullscreen ? 'flex h-full w-full flex-col' : ''}`}
        >
          <div className="flex shrink-0 items-center justify-end gap-2 border-b border-gray-200 p-2 dark:border-gray-700">
            <Button variant="ghost" onClick={toggleFullscreen}>
              <span className="inline-flex items-center gap-1.5">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                {isFullscreen ? t('common.fullscreenExit') : t('common.fullscreenEnter')}
              </span>
            </Button>
          </div>
          <div className={`w-full p-2 ${isFullscreen ? 'flex-1' : 'h-[560px]'}`}>
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
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.value / 10000}
                            onChange={(e) => {
                              const newData = [...mapData]
                              newData[index] = { ...newData[index], value: Number(e.target.value) * 10000 }
                              setMapData(newData)
                            }}
                            className="w-28 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{t('china.unitWan')}</span>
                        </div>
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

export default ChinaMapPanel
