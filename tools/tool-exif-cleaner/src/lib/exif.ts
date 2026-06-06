/**
 * EXIF parsing helpers (pure functions + a thin exifr wrapper).
 *
 * All functions are intentionally side-effect free so they are easy to test.
 * The actual EXIF extraction is performed by the `exifr` package, which is
 * dynamically imported to keep the initial bundle small.
 */

export interface ExifGps {
  /** Decimal latitude, signed (north positive). */
  latitude: number
  /** Decimal longitude, signed (east positive). */
  longitude: number
  /** Pretty-formatted "31.2304° N, 121.4737° E" string. */
  formatted: string
}

export interface ExifInfo {
  /** Camera manufacturer (Make). */
  make?: string
  /** Camera model. */
  model?: string
  /** Lens model. */
  lens?: string
  /** ISO speed. */
  iso?: number
  /** Aperture, e.g. "f/2.8". */
  aperture?: string
  /** Shutter speed, e.g. "1/250 s". */
  shutter?: string
  /** Focal length, e.g. "35 mm". */
  focalLength?: string
  /** Original capture timestamp as ISO string. */
  takenAt?: string
  /** Software field. */
  software?: string
  /** EXIF Orientation enum (1..8). */
  orientation?: number
  /** GPS data, if any was embedded. */
  gps?: ExifGps
}

/** Format a decimal lat/lon pair into the user-facing string. */
export function formatGps(lat: number, lon: number): string {
  const latLetter = lat >= 0 ? 'N' : 'S'
  const lonLetter = lon >= 0 ? 'E' : 'W'
  const latAbs = Math.abs(lat)
  const lonAbs = Math.abs(lon)
  // Use up to 4 decimal places, but trim insignificant trailing zeros only
  // when the user passed a tightly rounded number. We use toFixed(4) so the
  // output matches the spec exactly (31.2304° N, 121.4737° E).
  return `${formatCoord(latAbs)}° ${latLetter}, ${formatCoord(lonAbs)}° ${lonLetter}`
}

function formatCoord(value: number): string {
  // 4 decimal places ≈ 11 m precision, which is plenty for the privacy-warning UI.
  const fixed = value.toFixed(4)
  // Strip trailing zeros + dot when the number is already round (e.g. 31 -> "31").
  return fixed.replace(/\.?0+$/, '') || '0'
}

/** Format an exposure time in seconds into a camera-style string. */
export function formatExposure(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  if (seconds < 1) {
    const denom = Math.round(1 / seconds)
    return `1/${denom} s`
  }
  // Strip the trailing zero on integers (e.g. 2 -> "2 s" rather than "2.0 s").
  const rounded = Math.round(seconds * 10) / 10
  const text = Number.isInteger(rounded) ? String(rounded) : String(rounded)
  return `${text} s`
}

/** Format aperture (FNumber) into "f/2.8". */
export function formatAperture(fNumber: number): string {
  if (!Number.isFinite(fNumber) || fNumber <= 0) return ''
  const rounded = Math.round(fNumber * 10) / 10
  return `f/${rounded}`
}

/** Format focal length (mm) into a string like "35 mm". */
export function formatFocalLength(mm: number): string {
  if (!Number.isFinite(mm) || mm <= 0) return ''
  const rounded = Math.round(mm * 10) / 10
  return `${rounded} mm`
}

interface ExifrRawTags {
  Make?: string
  Model?: string
  LensModel?: string
  Lens?: string
  ISO?: number
  FNumber?: number
  ApertureValue?: number
  ExposureTime?: number
  FocalLength?: number
  DateTimeOriginal?: Date | string
  CreateDate?: Date | string
  ModifyDate?: Date | string
  Software?: string
  Orientation?: number
  latitude?: number
  longitude?: number
  GPSLatitude?: number
  GPSLongitude?: number
}

/**
 * Normalise a raw exifr result into our `ExifInfo` shape.
 * Exposed for testing — the production code calls `parseExif` instead.
 */
export function normalizeExif(raw: ExifrRawTags | null | undefined): ExifInfo | null {
  if (!raw || typeof raw !== 'object') return null
  const info: ExifInfo = {}

  if (typeof raw.Make === 'string' && raw.Make.trim()) info.make = raw.Make.trim()
  if (typeof raw.Model === 'string' && raw.Model.trim()) info.model = raw.Model.trim()
  const lens = raw.LensModel ?? raw.Lens
  if (typeof lens === 'string' && lens.trim()) info.lens = lens.trim()
  if (typeof raw.ISO === 'number') info.iso = raw.ISO
  if (typeof raw.FNumber === 'number') info.aperture = formatAperture(raw.FNumber)
  if (typeof raw.ExposureTime === 'number') info.shutter = formatExposure(raw.ExposureTime)
  if (typeof raw.FocalLength === 'number') info.focalLength = formatFocalLength(raw.FocalLength)

  const taken = raw.DateTimeOriginal ?? raw.CreateDate ?? raw.ModifyDate
  if (taken instanceof Date && !Number.isNaN(taken.getTime())) {
    info.takenAt = taken.toISOString()
  } else if (typeof taken === 'string' && taken.trim()) {
    info.takenAt = taken.trim()
  }

  if (typeof raw.Software === 'string' && raw.Software.trim()) info.software = raw.Software.trim()
  if (typeof raw.Orientation === 'number') info.orientation = raw.Orientation

  const lat = raw.latitude ?? raw.GPSLatitude
  const lon = raw.longitude ?? raw.GPSLongitude
  if (typeof lat === 'number' && typeof lon === 'number' && Number.isFinite(lat) && Number.isFinite(lon)) {
    info.gps = {
      latitude: lat,
      longitude: lon,
      formatted: formatGps(lat, lon),
    }
  }

  // Empty objects from exifr still count as "no readable EXIF".
  if (Object.keys(info).length === 0) return null
  return info
}

/**
 * Parse EXIF data from a File / Blob / ArrayBuffer. Returns `null` when the
 * input does not contain any readable metadata.
 */
export async function parseExif(input: File | Blob | ArrayBuffer): Promise<ExifInfo | null> {
  // Empty buffers cannot contain EXIF — short-circuit to avoid loading exifr.
  if (input instanceof ArrayBuffer && input.byteLength === 0) return null
  if (input instanceof Blob && input.size === 0) return null

  let exifr: typeof import('exifr')
  try {
    exifr = await import('exifr')
  } catch {
    return null
  }

  try {
    const raw = await exifr.parse(input as ArrayBuffer | Blob, {
      gps: true,
      tiff: true,
      ifd0: true,
      exif: true,
      pick: [
        'Make',
        'Model',
        'LensModel',
        'Lens',
        'ISO',
        'FNumber',
        'ApertureValue',
        'ExposureTime',
        'FocalLength',
        'DateTimeOriginal',
        'CreateDate',
        'ModifyDate',
        'Software',
        'Orientation',
        'GPSLatitude',
        'GPSLongitude',
        'latitude',
        'longitude',
      ],
    })
    return normalizeExif(raw as ExifrRawTags)
  } catch {
    return null
  }
}
