import { describe, it, expect } from 'vitest'
import {
  formatAperture,
  formatExposure,
  formatFocalLength,
  formatGps,
  normalizeExif,
  parseExif,
} from './exif'

describe('formatGps', () => {
  it('formats positive lat/lon with N/E letters', () => {
    expect(formatGps(31.2304, 121.4737)).toBe('31.2304° N, 121.4737° E')
  })

  it('formats negative lat/lon with S/W letters and absolute values', () => {
    expect(formatGps(-31.2304, -121.4737)).toBe('31.2304° S, 121.4737° W')
  })

  it('trims trailing zeros for round coordinates', () => {
    expect(formatGps(0, 0)).toBe('0° N, 0° E')
  })

  it('handles a mixed-sign pair', () => {
    expect(formatGps(35.6762, -139.6503)).toBe('35.6762° N, 139.6503° W')
  })
})

describe('formatExposure', () => {
  it('converts a sub-second exposure into a 1/n fraction', () => {
    expect(formatExposure(0.001)).toBe('1/1000 s')
  })

  it('keeps a sub-second exposure rounded to the nearest fraction', () => {
    expect(formatExposure(1 / 250)).toBe('1/250 s')
  })

  it('preserves seconds for exposures >= 1 second', () => {
    expect(formatExposure(2.5)).toBe('2.5 s')
  })

  it('drops the decimal for integer seconds', () => {
    expect(formatExposure(2)).toBe('2 s')
  })

  it('returns an empty string for non-positive input', () => {
    expect(formatExposure(0)).toBe('')
    expect(formatExposure(-1)).toBe('')
  })
})

describe('formatAperture / formatFocalLength', () => {
  it('formats aperture with the f/ prefix', () => {
    expect(formatAperture(2.8)).toBe('f/2.8')
  })

  it('rejects invalid aperture values', () => {
    expect(formatAperture(0)).toBe('')
  })

  it('formats focal length in millimetres', () => {
    expect(formatFocalLength(35)).toBe('35 mm')
  })
})

describe('parseExif', () => {
  it('returns null for an empty ArrayBuffer', async () => {
    const empty = new ArrayBuffer(0)
    expect(await parseExif(empty)).toBeNull()
  })

  it('returns null for an empty Blob', async () => {
    const empty = new Blob([])
    expect(await parseExif(empty)).toBeNull()
  })
})

describe('normalizeExif', () => {
  it('returns null when raw is empty', () => {
    expect(normalizeExif(null)).toBeNull()
    expect(normalizeExif({})).toBeNull()
  })

  it('extracts the well-known fields', () => {
    const taken = new Date('2024-01-02T03:04:05Z')
    const info = normalizeExif({
      Make: 'Sony  ',
      Model: 'ILCE-7M3',
      LensModel: 'FE 35mm F1.8',
      ISO: 200,
      FNumber: 2.8,
      ExposureTime: 1 / 250,
      FocalLength: 35,
      DateTimeOriginal: taken,
      Software: 'Lightroom 13.0',
      Orientation: 1,
      latitude: 31.2304,
      longitude: 121.4737,
    })
    expect(info).not.toBeNull()
    expect(info?.make).toBe('Sony')
    expect(info?.model).toBe('ILCE-7M3')
    expect(info?.lens).toBe('FE 35mm F1.8')
    expect(info?.iso).toBe(200)
    expect(info?.aperture).toBe('f/2.8')
    expect(info?.shutter).toBe('1/250 s')
    expect(info?.focalLength).toBe('35 mm')
    expect(info?.takenAt).toBe(taken.toISOString())
    expect(info?.software).toBe('Lightroom 13.0')
    expect(info?.orientation).toBe(1)
    expect(info?.gps?.formatted).toBe('31.2304° N, 121.4737° E')
  })
})
