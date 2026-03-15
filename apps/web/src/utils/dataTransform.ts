export type StructuredValue =
  | string
  | number
  | boolean
  | null
  | StructuredValue[]
  | { [key: string]: StructuredValue }

interface ParsedLine {
  indent: number
  text: string
}

function splitCsvLine(line: string, delimiter: string) {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current)
      current = ''
      continue
    }

    current += char
  }

  cells.push(current)
  return cells
}

export function detectDelimiter(text: string) {
  const sample = text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .slice(0, 5)

  const candidates = [',', '\t', ';', '|']
  const scores = candidates.map((delimiter) => ({
    delimiter,
    score: sample.reduce((sum, line) => sum + splitCsvLine(line, delimiter).length, 0),
  }))

  return scores.sort((a, b) => b.score - a.score)[0]?.delimiter || ','
}

export function parseDelimitedText(text: string, delimiter = detectDelimiter(text)) {
  return text
    .replace(/\ufeff/g, '')
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map((line) => splitCsvLine(line, delimiter))
}

function escapeCell(value: string, delimiter: string) {
  if (value.includes('"') || value.includes('\n') || value.includes(delimiter)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function stringifyDelimited(rows: string[][], delimiter = ',') {
  return rows
    .map((row) => row.map((cell) => escapeCell(cell ?? '', delimiter)).join(delimiter))
    .join('\n')
}

export function tableToMarkdown(rows: string[][]) {
  if (!rows.length) return ''
  const [header, ...body] = rows
  const safeHeader = header.map((cell) => cell || 'Column')
  const divider = safeHeader.map(() => '---')
  const lines = [safeHeader, divider, ...body]
  return lines.map((row) => `| ${row.map((cell) => cell || '').join(' | ')} |`).join('\n')
}

function uniqueHeaders(header: string[]) {
  const counts = new Map<string, number>()

  return header.map((cell, index) => {
    const base = (cell || `column_${index + 1}`).trim() || `column_${index + 1}`
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    return count === 0 ? base : `${base}_${count + 1}`
  })
}

export function tableToJsonRecords(rows: string[][]) {
  if (rows.length < 2) return []
  const [header, ...body] = rows
  const headers = uniqueHeaders(header)
  return body.map((row) => {
    const record: Record<string, string> = {}
    headers.forEach((key, index) => {
      record[key] = row[index] ?? ''
    })
    return record
  })
}

export function jsonRecordsToTable(records: Record<string, unknown>[]) {
  if (!records.length) return [['']]
  const headers = Array.from(
    records.reduce((set, record) => {
      Object.keys(record).forEach((key) => set.add(key))
      return set
    }, new Set<string>())
  )

  const rows = records.map((record) =>
    headers.map((key) => {
      const value = record[key]
      if (value == null) return ''
      return typeof value === 'string' ? value : JSON.stringify(value)
    })
  )

  return [headers, ...rows]
}

function splitKeyValue(text: string) {
  const colonIndex = text.indexOf(':')
  if (colonIndex === -1) throw new Error(`YAML 语法错误: "${text}" 缺少 ":"`)
  return {
    key: text.slice(0, colonIndex).trim(),
    value: text.slice(colonIndex + 1).trim(),
  }
}

function parseYamlScalar(value: string): StructuredValue {
  if (value === '' || value === 'null' || value === '~') return null
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    const items = value.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean)
    return items.map((item) => parseYamlScalar(item))
  }
  return value
}

function normalizeYamlLines(text: string) {
  return text
    .replace(/\t/g, '  ')
    .split(/\r?\n/)
    .map((raw) => raw.replace(/\s+$/, ''))
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => ({
      indent: line.match(/^ */)?.[0].length ?? 0,
      text: line.trim(),
    }))
}

function parseYamlBlock(lines: ParsedLine[], startIndex: number, indent: number): [StructuredValue, number] {
  if (startIndex >= lines.length) return [null, startIndex]
  const current = lines[startIndex]

  if (current.indent < indent) return [null, startIndex]
  if (current.text.startsWith('- ')) return parseYamlArray(lines, startIndex, indent)
  return parseYamlObject(lines, startIndex, indent)
}

function parseYamlArray(lines: ParsedLine[], startIndex: number, indent: number): [StructuredValue[], number] {
  const items: StructuredValue[] = []
  let index = startIndex

  while (index < lines.length) {
    const line = lines[index]
    if (line.indent < indent) break
    if (line.indent !== indent || !line.text.startsWith('- ')) break

    const itemText = line.text.slice(2).trim()
    index += 1

    if (!itemText) {
      const [nested, nextIndex] = parseYamlBlock(lines, index, indent + 2)
      items.push(nested)
      index = nextIndex
      continue
    }

    if (itemText.includes(':')) {
      const { key, value } = splitKeyValue(itemText)
      const objectValue: Record<string, StructuredValue> = {}

      if (!value) {
        const [nested, nextIndex] = parseYamlBlock(lines, index, indent + 2)
        objectValue[key] = nested
        index = nextIndex
      } else {
        objectValue[key] = parseYamlScalar(value)
      }

      while (index < lines.length && lines[index].indent === indent + 2 && !lines[index].text.startsWith('- ')) {
        const [tailObject, nextIndex] = parseYamlObject(lines, index, indent + 2)
        Object.assign(objectValue, tailObject)
        index = nextIndex
      }

      items.push(objectValue)
      continue
    }

    items.push(parseYamlScalar(itemText))
  }

  return [items, index]
}

function parseYamlObject(
  lines: ParsedLine[],
  startIndex: number,
  indent: number
): [Record<string, StructuredValue>, number] {
  const objectValue: Record<string, StructuredValue> = {}
  let index = startIndex

  while (index < lines.length) {
    const line = lines[index]
    if (line.indent < indent) break
    if (line.indent !== indent || line.text.startsWith('- ')) break

    const { key, value } = splitKeyValue(line.text)
    index += 1

    if (!value) {
      const [nested, nextIndex] = parseYamlBlock(lines, index, indent + 2)
      objectValue[key] = nested
      index = nextIndex
      continue
    }

    objectValue[key] = parseYamlScalar(value)
  }

  return [objectValue, index]
}

export function parseYaml(text: string) {
  const lines = normalizeYamlLines(text)
  if (!lines.length) return null
  const [result] = parseYamlBlock(lines, 0, lines[0].indent)
  return result
}

function formatYamlScalar(value: StructuredValue) {
  if (value == null) return 'null'
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  if (value === '') return '""'
  const strValue = value as string
  if (/[:#\-\n]/.test(strValue) || /^\s|\s$/.test(strValue)) {
    return JSON.stringify(value)
  }
  return value
}

export function stringifyYaml(value: StructuredValue, indent = 0): string {
  const padding = ' '.repeat(indent)

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === 'object') {
          const nested = stringifyYaml(item, indent + 2)
          return `${padding}-\n${nested}`
        }
        return `${padding}- ${formatYamlScalar(item)}`
      })
      .join('\n')
  }

  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, nestedValue]) => {
        if (nestedValue && typeof nestedValue === 'object') {
          return `${padding}${key}:\n${stringifyYaml(nestedValue, indent + 2)}`
        }
        return `${padding}${key}: ${formatYamlScalar(nestedValue)}`
      })
      .join('\n')
  }

  return `${padding}${formatYamlScalar(value)}`
}

function elementToStructuredValue(element: Element): StructuredValue {
  const attributes = Array.from(element.attributes)
  const childElements = Array.from(element.children)
  const textNodes = Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent?.trim() ?? '')
    .filter(Boolean)

  if (!attributes.length && !childElements.length) {
    return textNodes[0] ?? ''
  }

  const result: Record<string, StructuredValue> = {}

  attributes.forEach((attribute) => {
    result[`@${attribute.name}`] = attribute.value
  })

  childElements.forEach((child) => {
    const childValue = elementToStructuredValue(child)
    const current = result[child.tagName]
    if (current === undefined) {
      result[child.tagName] = childValue
      return
    }
    result[child.tagName] = Array.isArray(current) ? [...current, childValue] : [current, childValue]
  })

  if (textNodes.length) {
    result['#text'] = textNodes.join(' ')
  }

  return result
}

export function parseXml(text: string) {
  const parser = new DOMParser()
  const document = parser.parseFromString(text, 'application/xml')
  const parserError = document.querySelector('parsererror')
  if (parserError) {
    throw new Error(parserError.textContent?.trim() || 'XML 解析失败')
  }
  return {
    [document.documentElement.tagName]: elementToStructuredValue(document.documentElement),
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildXmlNode(name: string, value: StructuredValue): string {
  if (Array.isArray(value)) {
    return value.map((item) => buildXmlNode(name, item)).join('')
  }

  if (value == null) return `<${name} />`
  if (typeof value !== 'object') return `<${name}>${escapeXml(String(value))}</${name}>`

  const attributes = Object.entries(value)
    .filter(([key]) => key.startsWith('@'))
    .map(([key, attrValue]) => `${key.slice(1)}="${escapeXml(String(attrValue ?? ''))}"`)
    .join(' ')

  const textContent = value['#text']
  const childNodes = Object.entries(value)
    .filter(([key]) => !key.startsWith('@') && key !== '#text')
    .map(([key, childValue]) => buildXmlNode(key, childValue))
    .join('')

  const openTag = attributes ? `<${name} ${attributes}>` : `<${name}>`
  if (!childNodes && textContent == null) {
    return attributes ? `<${name} ${attributes} />` : `<${name} />`
  }

  return `${openTag}${textContent != null ? escapeXml(String(textContent)) : ''}${childNodes}</${name}>`
}

export function stringifyXml(value: StructuredValue) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return buildXmlNode('root', value)
  }

  const entries = Object.entries(value)
  if (entries.length === 1) {
    const [rootKey, rootValue] = entries[0]
    return buildXmlNode(rootKey, rootValue)
  }

  return buildXmlNode('root', value)
}
