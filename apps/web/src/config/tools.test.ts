import { describe, it, expect, vi } from 'vitest'
import i18n from '../i18n'
import {
  TOOLS,
  TOOLS_BY_PATH,
  getToolByPath,
  getToolTitle,
  getToolDescription,
  getToolsForNav,
} from './tools'

describe('tools config', () => {
  describe('getToolByPath', () => {
    it('returns tool for exact path', () => {
      expect(getToolByPath('/')).toBeDefined()
      expect(getToolByPath('/').path).toBe('/')
      expect(getToolByPath('/json')).toBeDefined()
      expect(getToolByPath('/json').nameKey).toBe('tools.json')
      expect(getToolByPath('/dns-global-check')).toBeDefined()
      expect(getToolByPath('/ppt-generator')).toBeDefined()
    })

    it('returns undefined for unknown path', () => {
      expect(getToolByPath('/unknown')).toBeUndefined()
      expect(getToolByPath('')).toBeUndefined()
      expect(getToolByPath('/json/extra')).toBeUndefined()
    })
  })

  describe('getToolTitle', () => {
    it('uses i18nNamespace title when present', () => {
      const t = vi.fn((key: string) => (key === 'toolJson:title' ? 'JSON 工具' : key))
      const tool = getToolByPath('/json')!
      expect(getToolTitle(tool, t)).toBe('JSON 工具')
      expect(t).toHaveBeenCalledWith('toolJson:title')
    })

    it('falls back to nav nameKey when tool namespace is not loaded', () => {
      const hasLoadedNamespaceSpy = vi.spyOn(i18n, 'hasLoadedNamespace').mockReturnValue(false)
      const existsSpy = vi.spyOn(i18n, 'exists').mockReturnValue(false)
      const t = vi.fn((key: string) => (key === 'tools.wooden_fish' ? '电子木鱼' : key))
      const tool = getToolByPath('/wooden-fish')!

      expect(getToolTitle(tool, t)).toBe('电子木鱼')
      expect(t).toHaveBeenCalledWith('tools.wooden_fish')

      hasLoadedNamespaceSpy.mockRestore()
      existsSpy.mockRestore()
    })

    it('uses nameKey when no i18nNamespace', () => {
      const t = vi.fn((key: string) => (key === 'tools.base64' ? 'Base64' : key))
      const tool = getToolByPath('/base64')!
      expect(getToolTitle(tool, t)).toBe('Base64')
      expect(t).toHaveBeenCalledWith('tools.base64')
    })
  })

  describe('getToolDescription', () => {
    it('uses i18nNamespace description when present', () => {
      const t = vi.fn((key: string) => (key === 'toolJson:description' ? 'JSON 格式化' : key))
      const tHome = vi.fn()
      const tool = getToolByPath('/json')!
      expect(getToolDescription(tool, t, tHome)).toBe('JSON 格式化')
      expect(t).toHaveBeenCalledWith('toolJson:description')
      expect(tHome).not.toHaveBeenCalled()
    })

    it('uses home.toolDesc when no i18nNamespace', () => {
      const t = vi.fn()
      const tHome = vi.fn((key: string) => (key === 'toolDesc.base64' ? 'Base64 编解码' : key))
      const tool = getToolByPath('/base64')!
      expect(getToolDescription(tool, t, tHome)).toBe('Base64 编解码')
      expect(tHome).toHaveBeenCalledWith('toolDesc.base64')
    })
  })

  describe('getToolsForNav', () => {
    it('excludes home path', () => {
      const nav = getToolsForNav()
      expect(nav.some((t) => t.path === '/')).toBe(false)
      expect(nav.length).toBe(TOOLS.length - 1)
    })
  })

  describe('TOOLS_BY_PATH', () => {
    it('has entry for every TOOLS path', () => {
      for (const t of TOOLS) {
        expect(TOOLS_BY_PATH.get(t.path)).toEqual(t)
      }
    })
  })
})
