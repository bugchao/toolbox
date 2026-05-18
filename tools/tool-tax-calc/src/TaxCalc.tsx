import React, { useMemo, useState } from 'react'
import {
  Receipt,
  Wallet,
  Calculator,
  ChevronDown,
  Info,
  TrendingUp,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

import {
  calcAnnualIIT,
  calcBonusSingleIIT,
  calcMonthlyWithholding,
  ANNUAL_BRACKETS,
  MONTHLY_BASIC_DEDUCT,
} from './iitTables'

const NAMESPACE = 'toolTaxCalc'

interface ItemizedState {
  childEducation: { enabled: boolean; count: number } // 1000/月/孩
  babyCare: { enabled: boolean; count: number } // 2000/月/孩（≤3 岁）
  continuingEducation: boolean // 400/月
  housingLoan: boolean // 1000/月
  housingRent: { enabled: boolean; tier: 'cityA' | 'cityB' | 'cityC' } // 1500/1100/800
  elderlySupport: { enabled: boolean; sole: boolean; share: number } // 3000 or share ≤1500
}

const DEFAULT_ITEMIZED: ItemizedState = {
  childEducation: { enabled: false, count: 1 },
  babyCare: { enabled: false, count: 1 },
  continuingEducation: false,
  housingLoan: false,
  housingRent: { enabled: false, tier: 'cityA' },
  elderlySupport: { enabled: false, sole: true, share: 1500 },
}

function calcItemizedMonthly(s: ItemizedState): number {
  let total = 0
  if (s.childEducation.enabled) total += 1000 * Math.max(0, s.childEducation.count)
  if (s.babyCare.enabled) total += 2000 * Math.max(0, s.babyCare.count)
  if (s.continuingEducation) total += 400
  if (s.housingLoan) total += 1000
  if (s.housingRent.enabled) {
    total += s.housingRent.tier === 'cityA' ? 1500 : s.housingRent.tier === 'cityB' ? 1100 : 800
  }
  if (s.elderlySupport.enabled) {
    total += s.elderlySupport.sole ? 3000 : Math.min(1500, Math.max(0, s.elderlySupport.share))
  }
  return total
}

const fmtMoney = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const TaxCalc: React.FC = () => {
  const { t, i18n } = useTranslation(NAMESPACE)
  const isZh = (i18n.resolvedLanguage || i18n.language || 'zh').startsWith('zh')

  // ── State ──────────────────────────────────────────────────
  const [monthlyPretax, setMonthlyPretax] = useState(20000)
  const [insuranceMode, setInsuranceMode] = useState<'amount' | 'rate'>('rate')
  const [insuranceAmount, setInsuranceAmount] = useState(4400) // ~22% × 20000
  const [insuranceRate, setInsuranceRate] = useState(22) // %
  const [itemized, setItemized] = useState<ItemizedState>(DEFAULT_ITEMIZED)
  const [yearEndBonus, setYearEndBonus] = useState(0)
  const [itemizedOpen, setItemizedOpen] = useState(false)
  const [tableOpen, setTableOpen] = useState(true)

  const insurancePerMonth = useMemo(() => {
    return insuranceMode === 'amount'
      ? Math.max(0, insuranceAmount)
      : Math.max(0, monthlyPretax * (insuranceRate / 100))
  }, [insuranceMode, insuranceAmount, insuranceRate, monthlyPretax])

  const itemizedMonthly = useMemo(() => calcItemizedMonthly(itemized), [itemized])

  const monthlyRows = useMemo(() => {
    return calcMonthlyWithholding(
      Array.from({ length: 12 }, () => monthlyPretax),
      Array.from({ length: 12 }, () => insurancePerMonth),
      Array.from({ length: 12 }, () => itemizedMonthly),
    )
  }, [monthlyPretax, insurancePerMonth, itemizedMonthly])

  const annualSummary = useMemo(() => {
    const pretax = monthlyPretax * 12
    const insurance = insurancePerMonth * 12
    const itemizedYear = itemizedMonthly * 12
    const basic = MONTHLY_BASIC_DEDUCT * 12
    const taxable = Math.max(0, pretax - insurance - itemizedYear - basic)
    const { tax, rate, deduct } = calcAnnualIIT(taxable)
    return { pretax, insurance, itemizedYear, basic, taxable, tax, rate, deduct, takeHome: pretax - insurance - tax }
  }, [monthlyPretax, insurancePerMonth, itemizedMonthly])

  // 年终奖对比
  const bonusComparison = useMemo(() => {
    if (yearEndBonus <= 0) return null
    // 单独计税
    const singleTax = calcBonusSingleIIT(yearEndBonus).tax
    // 合并入综合所得：把奖金加到 taxable 上
    const merged = calcAnnualIIT(annualSummary.taxable + yearEndBonus).tax
    const mergedDelta = merged - annualSummary.tax // 增加部分
    return {
      single: singleTax,
      mergedDelta,
      better: singleTax < mergedDelta ? 'single' : 'merged',
      diff: Math.abs(singleTax - mergedDelta),
    }
  }, [yearEndBonus, annualSummary])

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{t('disclaimer')}</span>
      </div>

      {/* Input section */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 space-y-5">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Wallet className="w-4 h-4" /> {t('section.basic')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('field.monthlyPretax')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
              <input
                type="number"
                min={0}
                step={100}
                value={monthlyPretax}
                onChange={(e) => setMonthlyPretax(Math.max(0, Number(e.target.value) || 0))}
                className="w-full pl-7 pr-3 py-2 text-base border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t('field.insurance')}{' '}
              <span className="text-xs text-gray-400">({t('field.insuranceHint')})</span>
            </label>
            <div className="flex gap-2">
              <select
                value={insuranceMode}
                onChange={(e) => setInsuranceMode(e.target.value as 'amount' | 'rate')}
                className="px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="rate">{t('field.insuranceModeRate')}</option>
                <option value="amount">{t('field.insuranceModeAmount')}</option>
              </select>
              {insuranceMode === 'rate' ? (
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={insuranceRate}
                    onChange={(e) => setInsuranceRate(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
                    className="w-full pr-7 pl-3 py-2 text-base border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              ) : (
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={insuranceAmount}
                    onChange={(e) => setInsuranceAmount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full pl-7 pr-3 py-2 text-base border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ≈ ¥{fmtMoney(insurancePerMonth)} / {t('field.perMonth')}
            </div>
          </div>
        </div>
      </section>

      {/* Itemized deductions */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setItemizedOpen((v) => !v)}
          aria-expanded={itemizedOpen}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {t('section.itemized')}
          <span className="text-xs text-gray-400 font-normal">
            ¥{fmtMoney(itemizedMonthly)} / {t('field.perMonth')}
          </span>
          <ChevronDown
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
              itemizedOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {itemizedOpen && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
            {/* 子女教育 */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={itemized.childEducation.enabled}
                  onChange={(e) =>
                    setItemized({
                      ...itemized,
                      childEducation: { ...itemized.childEducation, enabled: e.target.checked },
                    })
                  }
                  className="rounded border-gray-300"
                />
                {t('itemized.childEducation')}{' '}
                <span className="text-xs text-gray-400">(¥1000/{t('itemized.perChild')})</span>
              </label>
              {itemized.childEducation.enabled && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{t('itemized.childCount')}</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={itemized.childEducation.count}
                    onChange={(e) =>
                      setItemized({
                        ...itemized,
                        childEducation: {
                          ...itemized.childEducation,
                          count: Math.max(1, Math.min(10, Number(e.target.value) || 1)),
                        },
                      })
                    }
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* 婴幼儿照护 */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={itemized.babyCare.enabled}
                  onChange={(e) =>
                    setItemized({
                      ...itemized,
                      babyCare: { ...itemized.babyCare, enabled: e.target.checked },
                    })
                  }
                  className="rounded border-gray-300"
                />
                {t('itemized.babyCare')}{' '}
                <span className="text-xs text-gray-400">(¥2000/{t('itemized.perChild')})</span>
              </label>
              {itemized.babyCare.enabled && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{t('itemized.childCount')}</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={itemized.babyCare.count}
                    onChange={(e) =>
                      setItemized({
                        ...itemized,
                        babyCare: {
                          ...itemized.babyCare,
                          count: Math.max(1, Math.min(10, Number(e.target.value) || 1)),
                        },
                      })
                    }
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* 继续教育 */}
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={itemized.continuingEducation}
                onChange={(e) =>
                  setItemized({ ...itemized, continuingEducation: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              {t('itemized.continuingEducation')}{' '}
              <span className="text-xs text-gray-400">(¥400/{t('field.perMonth')})</span>
            </label>

            {/* 住房贷款利息 */}
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={itemized.housingLoan}
                onChange={(e) => setItemized({ ...itemized, housingLoan: e.target.checked })}
                className="rounded border-gray-300"
              />
              {t('itemized.housingLoan')}{' '}
              <span className="text-xs text-gray-400">(¥1000/{t('field.perMonth')})</span>
            </label>

            {/* 住房租金 */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={itemized.housingRent.enabled}
                  onChange={(e) =>
                    setItemized({
                      ...itemized,
                      housingRent: { ...itemized.housingRent, enabled: e.target.checked },
                    })
                  }
                  className="rounded border-gray-300"
                />
                {t('itemized.housingRent')}
              </label>
              {itemized.housingRent.enabled && (
                <select
                  value={itemized.housingRent.tier}
                  onChange={(e) =>
                    setItemized({
                      ...itemized,
                      housingRent: {
                        ...itemized.housingRent,
                        tier: e.target.value as 'cityA' | 'cityB' | 'cityC',
                      },
                    })
                  }
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="cityA">{t('itemized.cityA')} (¥1500)</option>
                  <option value="cityB">{t('itemized.cityB')} (¥1100)</option>
                  <option value="cityC">{t('itemized.cityC')} (¥800)</option>
                </select>
              )}
            </div>

            {/* 赡养老人 */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={itemized.elderlySupport.enabled}
                  onChange={(e) =>
                    setItemized({
                      ...itemized,
                      elderlySupport: { ...itemized.elderlySupport, enabled: e.target.checked },
                    })
                  }
                  className="rounded border-gray-300"
                />
                {t('itemized.elderlySupport')}
              </label>
              {itemized.elderlySupport.enabled && (
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <input
                      type="radio"
                      checked={itemized.elderlySupport.sole}
                      onChange={() =>
                        setItemized({
                          ...itemized,
                          elderlySupport: { ...itemized.elderlySupport, sole: true },
                        })
                      }
                    />
                    {t('itemized.elderlySole')} (¥3000)
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <input
                      type="radio"
                      checked={!itemized.elderlySupport.sole}
                      onChange={() =>
                        setItemized({
                          ...itemized,
                          elderlySupport: { ...itemized.elderlySupport, sole: false },
                        })
                      }
                    />
                    {t('itemized.elderlyShared')}
                  </label>
                  {!itemized.elderlySupport.sole && (
                    <input
                      type="number"
                      min={0}
                      max={1500}
                      step={100}
                      value={itemized.elderlySupport.share}
                      onChange={(e) =>
                        setItemized({
                          ...itemized,
                          elderlySupport: {
                            ...itemized.elderlySupport,
                            share: Math.max(0, Math.min(1500, Number(e.target.value) || 0)),
                          },
                        })
                      }
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Year-end bonus */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 space-y-3">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> {t('section.bonus')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('field.yearEndBonus')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={yearEndBonus}
                onChange={(e) => setYearEndBonus(Math.max(0, Number(e.target.value) || 0))}
                className="w-full pl-7 pr-3 py-2 text-base border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        {bonusComparison && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className={`rounded-md border p-3 ${
                bonusComparison.better === 'single' ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-500">{t('bonus.singleTax')}</div>
              <div className="text-xl font-mono font-semibold text-gray-800">
                ¥{fmtMoney(bonusComparison.single)}
              </div>
              {bonusComparison.better === 'single' && (
                <div className="text-xs text-emerald-700 mt-1">
                  {t('bonus.betterBy', { amount: fmtMoney(bonusComparison.diff) })}
                </div>
              )}
            </div>
            <div
              className={`rounded-md border p-3 ${
                bonusComparison.better === 'merged' ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-500">{t('bonus.mergedDelta')}</div>
              <div className="text-xl font-mono font-semibold text-gray-800">
                ¥{fmtMoney(bonusComparison.mergedDelta)}
              </div>
              {bonusComparison.better === 'merged' && (
                <div className="text-xs text-emerald-700 mt-1">
                  {t('bonus.betterBy', { amount: fmtMoney(bonusComparison.diff) })}
                </div>
              )}
            </div>
          </div>
        )}
        {yearEndBonus > 0 && !bonusComparison && (
          <div className="text-xs text-gray-400">{t('bonus.computingHint')}</div>
        )}
        <p className="text-xs text-gray-400">{t('bonus.hint')}</p>
      </section>

      {/* Annual summary */}
      <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-5 md:p-6 space-y-3">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Calculator className="w-4 h-4" /> {t('section.summary')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <Stat label={t('summary.annualPretax')} value={`¥${fmtMoney(annualSummary.pretax)}`} />
          <Stat
            label={t('summary.totalDeductions')}
            value={`¥${fmtMoney(annualSummary.insurance + annualSummary.basic + annualSummary.itemizedYear)}`}
          />
          <Stat
            label={t('summary.annualTax')}
            value={`¥${fmtMoney(annualSummary.tax + (bonusComparison?.single ?? 0))}`}
            accent="rose"
          />
          <Stat
            label={t('summary.takeHome')}
            value={`¥${fmtMoney(annualSummary.takeHome + yearEndBonus - (bonusComparison?.single ?? 0))}`}
            accent="emerald"
          />
        </div>
        <div className="text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-1">
          <span>
            {t('summary.taxableAnnual')}: <span className="font-mono">¥{fmtMoney(annualSummary.taxable)}</span>
          </span>
          <span>
            {t('summary.topRate')}:{' '}
            <span className="font-mono">{(annualSummary.rate * 100).toFixed(0)}%</span>
          </span>
        </div>
      </section>

      {/* Monthly withholding table */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setTableOpen((v) => !v)}
          aria-expanded={tableOpen}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Receipt className="w-4 h-4" />
          {t('section.monthly')}
          <ChevronDown
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
              tableOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {tableOpen && (
          <div className="border-t border-gray-100 overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">{t('table.month')}</th>
                  <th className="px-3 py-2 text-right">{t('table.pretax')}</th>
                  <th className="px-3 py-2 text-right">{t('table.insurance')}</th>
                  <th className="px-3 py-2 text-right">{t('table.cumulativeTaxable')}</th>
                  <th className="px-3 py-2 text-right">{t('table.monthlyTax')}</th>
                  <th className="px-3 py-2 text-right">{t('table.takeHome')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyRows.map((r, i) => {
                  // Highlight when monthly tax jumps (= moved to a higher bracket)
                  const jumped = i > 0 && r.monthlyTax > monthlyRows[i - 1].monthlyTax + 0.01
                  return (
                    <tr key={r.month} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-700 font-medium">{r.month}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {fmtMoney(r.pretax)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-gray-500">
                        {fmtMoney(r.insurance)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-gray-500">
                        {fmtMoney(r.cumulativeTaxable)}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono tabular-nums ${
                          jumped ? 'text-rose-600 font-semibold' : 'text-rose-500'
                        }`}
                      >
                        {fmtMoney(r.monthlyTax)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                        {fmtMoney(r.takeHome)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reference brackets */}
      <details className="rounded-lg border border-gray-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 list-none flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {t('section.brackets')}
        </summary>
        <div className="px-4 pb-4 pt-2 overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="px-2 py-1 text-left">{t('table.range')}</th>
                <th className="px-2 py-1 text-right">{t('table.rate')}</th>
                <th className="px-2 py-1 text-right">{t('table.quickDeduct')}</th>
              </tr>
            </thead>
            <tbody>
              {ANNUAL_BRACKETS.map((b, i) => {
                const prev = i === 0 ? 0 : ANNUAL_BRACKETS[i - 1].upper
                const rangeText =
                  b.upper === Infinity
                    ? `> ¥${fmtMoney(prev)}`
                    : `¥${fmtMoney(prev)} ~ ¥${fmtMoney(b.upper)}`
                return (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-2 py-1 font-mono">{rangeText}</td>
                    <td className="px-2 py-1 text-right font-mono">{(b.rate * 100).toFixed(0)}%</td>
                    <td className="px-2 py-1 text-right font-mono">¥{fmtMoney(b.deduct)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!isZh && (
            <p className="text-xs text-gray-400 mt-2">
              Source: State Taxation Administration of China (2019 reform onwards).
            </p>
          )}
        </div>
      </details>
    </div>
  )
}

interface StatProps {
  label: string
  value: string
  accent?: 'rose' | 'emerald'
}
const Stat: React.FC<StatProps> = ({ label, value, accent }) => {
  const color =
    accent === 'rose'
      ? 'text-rose-700'
      : accent === 'emerald'
        ? 'text-emerald-700'
        : 'text-gray-800'
  return (
    <div className="rounded-md bg-white/70 border border-gray-200 p-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-base md:text-lg font-mono font-semibold tabular-nums ${color}`}>
        {value}
      </div>
    </div>
  )
}

export default TaxCalc
