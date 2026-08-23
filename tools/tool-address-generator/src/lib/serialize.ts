import type { ExportFormat, GeneratedAddress } from './types'

const CSV_COLUMNS: Array<keyof GeneratedAddress> = [
  'id',
  'countryCode',
  'countryName',
  'addressLine1',
  'addressLine2',
  'city',
  'region',
  'postalCode',
  'formatted',
]

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function serializeAddresses(addresses: GeneratedAddress[], format: ExportFormat): string {
  if (format === 'json') return JSON.stringify(addresses, null, 2)
  if (format === 'txt') return addresses.map((address) => address.formatted).join('\n\n')

  const rows = addresses.map((address) =>
    CSV_COLUMNS.map((column) => csvCell(address[column])).join(','),
  )
  return [CSV_COLUMNS.join(','), ...rows].join('\n')
}

export function exportMimeType(format: ExportFormat): string {
  if (format === 'json') return 'application/json;charset=utf-8'
  if (format === 'csv') return 'text/csv;charset=utf-8'
  return 'text/plain;charset=utf-8'
}
