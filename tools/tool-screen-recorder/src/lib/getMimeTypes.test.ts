import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getSupportedMimeTypes, getDefaultMimeType, getExtensionForMime } from './getMimeTypes'

describe('getMimeTypes', () => {
  describe('getSupportedMimeTypes', () => {
    let originalMediaRecorder: typeof MediaRecorder | undefined

    beforeEach(() => {
      originalMediaRecorder = window.MediaRecorder
    })

    afterEach(() => {
      if (originalMediaRecorder) {
        window.MediaRecorder = originalMediaRecorder
      } else {
        // @ts-expect-error - intentionally deleting for cleanup
        delete window.MediaRecorder
      }
    })

    it('returns empty array when MediaRecorder is not available', () => {
      // @ts-expect-error - intentionally setting to undefined for test
      delete window.MediaRecorder

      expect(getSupportedMimeTypes()).toEqual([])
    })

    it('filters MIME types based on MediaRecorder.isTypeSupported', () => {
      const mockIsTypeSupported = vi.fn((mime: string) => {
        return mime === 'video/webm; codecs=vp9' || mime === 'video/webm'
      })

      // @ts-expect-error - mocking for test
      window.MediaRecorder = {
        isTypeSupported: mockIsTypeSupported,
      }

      const result = getSupportedMimeTypes()

      expect(result).toEqual(['video/webm; codecs=vp9', 'video/webm'])
      expect(mockIsTypeSupported).toHaveBeenCalledTimes(4)
      expect(mockIsTypeSupported).toHaveBeenCalledWith('video/webm; codecs=vp9')
      expect(mockIsTypeSupported).toHaveBeenCalledWith('video/webm; codecs=vp8')
      expect(mockIsTypeSupported).toHaveBeenCalledWith('video/webm')
      expect(mockIsTypeSupported).toHaveBeenCalledWith('video/mp4')
    })

    it('returns all MIME types when all are supported', () => {
      const mockIsTypeSupported = vi.fn(() => true)

      // @ts-expect-error - mocking for test
      window.MediaRecorder = {
        isTypeSupported: mockIsTypeSupported,
      }

      const result = getSupportedMimeTypes()

      expect(result).toEqual([
        'video/webm; codecs=vp9',
        'video/webm; codecs=vp8',
        'video/webm',
        'video/mp4',
      ])
    })

    it('returns empty array when no MIME types are supported', () => {
      const mockIsTypeSupported = vi.fn(() => false)

      // @ts-expect-error - mocking for test
      window.MediaRecorder = {
        isTypeSupported: mockIsTypeSupported,
      }

      const result = getSupportedMimeTypes()

      expect(result).toEqual([])
    })
  })

  describe('getDefaultMimeType', () => {
    let originalMediaRecorder: typeof MediaRecorder | undefined

    beforeEach(() => {
      originalMediaRecorder = window.MediaRecorder
    })

    afterEach(() => {
      if (originalMediaRecorder) {
        window.MediaRecorder = originalMediaRecorder
      } else {
        // @ts-expect-error - intentionally deleting for cleanup
        delete window.MediaRecorder
      }
    })

    it('returns the first supported MIME type', () => {
      const mockIsTypeSupported = vi.fn((mime: string) => {
        return mime === 'video/webm; codecs=vp8' || mime === 'video/webm'
      })

      // @ts-expect-error - mocking for test
      window.MediaRecorder = {
        isTypeSupported: mockIsTypeSupported,
      }

      const result = getDefaultMimeType()

      expect(result).toBe('video/webm; codecs=vp8')
    })

    it('returns null when no MIME types are supported', () => {
      const mockIsTypeSupported = vi.fn(() => false)

      // @ts-expect-error - mocking for test
      window.MediaRecorder = {
        isTypeSupported: mockIsTypeSupported,
      }

      const result = getDefaultMimeType()

      expect(result).toBeNull()
    })

    it('returns null when MediaRecorder is not available', () => {
      // @ts-expect-error - intentionally setting to undefined for test
      delete window.MediaRecorder

      const result = getDefaultMimeType()

      expect(result).toBeNull()
    })
  })

  describe('getExtensionForMime', () => {
    it('returns "webm" for null MIME type', () => {
      expect(getExtensionForMime(null)).toBe('webm')
    })

    it('returns "webm" for video/webm MIME type', () => {
      expect(getExtensionForMime('video/webm')).toBe('webm')
    })

    it('returns "webm" for video/webm with codecs', () => {
      expect(getExtensionForMime('video/webm; codecs=vp9')).toBe('webm')
      expect(getExtensionForMime('video/webm; codecs=vp8')).toBe('webm')
    })

    it('returns "mp4" for video/mp4 MIME type', () => {
      expect(getExtensionForMime('video/mp4')).toBe('mp4')
    })

    it('returns "mp4" for video/mp4 with codecs', () => {
      expect(getExtensionForMime('video/mp4; codecs=h264')).toBe('mp4')
    })

    it('returns "webm" for unknown MIME types', () => {
      expect(getExtensionForMime('video/unknown')).toBe('webm')
      expect(getExtensionForMime('audio/webm')).toBe('webm')
      expect(getExtensionForMime('invalid')).toBe('webm')
    })

    it('returns "webm" for empty string', () => {
      expect(getExtensionForMime('')).toBe('webm')
    })
  })
})
