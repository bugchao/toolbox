import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddressGenerator from './AddressGenerator'
import en from './locales/en.json'
import zh from './locales/zh.json'

const i18n = createInstance()
void i18n.init({
  lng: 'zh',
  fallbackLng: 'zh',
  resources: {
    zh: { toolAddressGenerator: zh },
    en: { toolAddressGenerator: en },
  },
  interpolation: { escapeValue: false },
  initImmediate: false,
})

function renderTool() {
  return render(
    <I18nextProvider i18n={i18n}>
      <AddressGenerator />
    </I18nextProvider>,
  )
}

describe('AddressGenerator', () => {
  beforeEach(() => {
    void i18n.changeLanguage('zh')
    vi.restoreAllMocks()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:address-export'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
  })

  it('shows real coverage and defaults Chinese UI to China', () => {
    renderTool()

    expect(screen.getByRole('heading', { name: '多国家地址生成器' })).toBeInTheDocument()
    expect(screen.getByText('59 个国家 / 地区格式')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: '国家 / 地区' })).toHaveValue('CN')
  })

  it('filters countries by English name and ISO code', () => {
    renderTool()
    const search = screen.getByRole('searchbox', { name: '搜索国家 / 地区' })

    fireEvent.change(search, { target: { value: 'Japan' } })
    expect(screen.getByRole('option', { name: /日本.*JP/ })).toBeInTheDocument()

    fireEvent.change(search, { target: { value: 'de' } })
    expect(screen.getByRole('option', { name: /德国.*DE/ })).toBeInTheDocument()
  })

  it('renders the complete English UI and defaults to the US', async () => {
    await i18n.changeLanguage('en')
    renderTool()

    expect(screen.getByRole('heading', { name: 'Global Address Generator' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Country or region' })).toHaveValue('US')
    expect(screen.getByText('59 country / region formats')).toBeInTheDocument()
  })

  it('generates a seeded batch and switching views does not regenerate', async () => {
    renderTool()
    fireEvent.change(screen.getByLabelText('生成数量'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Seed（可选）'), { target: { value: 'regression-42' } })
    fireEvent.click(screen.getByRole('button', { name: '生成地址' }))

    const firstResult = (await screen.findAllByTestId('address-formatted')).map((node) => node.textContent)
    expect(firstResult).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'JSON' }))
    expect(screen.getByTestId('json-output')).toHaveTextContent('countryCode')

    fireEvent.click(screen.getByRole('button', { name: '卡片' }))
    fireEvent.click(screen.getByRole('button', { name: '重新生成' }))
    await screen.findByRole('button', { name: '重新生成' })
    expect(screen.getAllByTestId('address-formatted').map((node) => node.textContent)).toEqual(firstResult)
  })

  it('supports deterministic random-country mode and copying one address', async () => {
    renderTool()
    fireEvent.click(screen.getByLabelText('每条随机国家'))
    expect(screen.getByRole('combobox', { name: '国家 / 地区' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Seed（可选）'), { target: { value: 'world-tour' } })
    fireEvent.click(screen.getByRole('button', { name: '生成地址' }))
    await screen.findByRole('button', { name: '重新生成' })
    fireEvent.click(screen.getAllByRole('button', { name: '复制这条地址' })[0])

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledOnce())
  })

  it('downloads the current records as CSV', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    renderTool()
    fireEvent.click(screen.getByRole('button', { name: '生成地址' }))
    await screen.findByRole('button', { name: '重新生成' })
    fireEvent.click(screen.getByRole('button', { name: '下载 CSV' }))

    expect(URL.createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:address-export')
  })
})
