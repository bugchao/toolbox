import { describe, it, expect } from 'vitest'
import {
  cellDisplayWidth,
  parseCsv,
  parseMarkdown,
  toCsv,
  toMarkdown,
  transpose,
  type Table,
} from './convert'

const t = (rows: string[][]): Table => ({ rows })

describe('parseCsv', () => {
  it('parses simple rows', () => {
    const r = parseCsv('a,b,c\n1,2,3')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.table.rows).toEqual([['a', 'b', 'c'], ['1', '2', '3']])
  })

  it('handles quoted fields with commas and newlines', () => {
    const r = parseCsv('name,note\n"Smith, John","line1\nline2"')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.table.rows[1][0]).toBe('Smith, John')
      expect(r.table.rows[1][1]).toBe('line1\nline2')
    }
  })

  it('unescapes doubled quotes', () => {
    const r = parseCsv('q\n"say ""hi"""')
    if (r.ok) expect(r.table.rows[1][0]).toBe('say "hi"')
  })

  it('accepts \\r\\n line endings', () => {
    const r = parseCsv('a,b\r\n1,2\r\n')
    if (r.ok) expect(r.table.rows).toEqual([['a', 'b'], ['1', '2']])
  })

  it('supports ; and tab delimiters', () => {
    const semi = parseCsv('a;b\n1;2', { delimiter: ';' })
    if (semi.ok) expect(semi.table.rows[0]).toEqual(['a', 'b'])
    const tab = parseCsv('a\tb\n1\t2', { delimiter: '\t' })
    if (tab.ok) expect(tab.table.rows[1]).toEqual(['1', '2'])
  })

  it('drops fully blank lines', () => {
    const r = parseCsv('a,b\n\n1,2\n  \n')
    if (r.ok) expect(r.table.rows).toHaveLength(2)
  })

  it('rejects empty input', () => {
    expect(parseCsv('  \n ').ok).toBe(false)
  })

  it('rejects unterminated quote', () => {
    expect(parseCsv('a,"broken').ok).toBe(false)
  })
})

describe('toCsv', () => {
  it('joins plain cells', () => {
    expect(toCsv(t([['a', 'b'], ['1', '2']]))).toBe('a,b\n1,2')
  })

  it('quotes cells containing delimiter / quote / newline', () => {
    const out = toCsv(t([['a,b', 'say "hi"', 'x\ny']]))
    expect(out).toBe('"a,b","say ""hi""","x\ny"')
  })

  it('round-trips through parseCsv', () => {
    const original = t([['name', 'note'], ['Smith, John', 'say "hi"\nnext']])
    const r = parseCsv(toCsv(original))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.table.rows).toEqual(original.rows)
  })
})

describe('parseMarkdown', () => {
  const MD = `| Name | Age |
| --- | --- |
| Alice | 30 |
| Bob | 25 |`

  it('parses header + body', () => {
    const r = parseMarkdown(MD)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.table.rows).toEqual([['Name', 'Age'], ['Alice', '30'], ['Bob', '25']])
    }
  })

  it('reads alignment row', () => {
    const r = parseMarkdown('| a | b | c | d |\n| :--- | :---: | ---: | --- |\n| 1 | 2 | 3 | 4 |')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.aligns).toEqual(['left', 'center', 'right', 'none'])
  })

  it('rejects when second row is not an align row', () => {
    expect(parseMarkdown('| a |\n| b |').ok).toBe(false)
  })

  it('rejects single line', () => {
    expect(parseMarkdown('| a | b |').ok).toBe(false)
  })

  it('pads short rows to header width', () => {
    const r = parseMarkdown('| a | b | c |\n| --- | --- | --- |\n| 1 |')
    if (r.ok) expect(r.table.rows[1]).toEqual(['1', '', ''])
  })

  it('handles escaped pipes in cells', () => {
    const r = parseMarkdown('| expr |\n| --- |\n| a \\| b |')
    if (r.ok) expect(r.table.rows[1][0]).toBe('a | b')
  })
})

describe('toMarkdown', () => {
  it('emits header + align row + body', () => {
    const md = toMarkdown(t([['a', 'b'], ['1', '2']]), { pretty: false })
    const lines = md.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('| a')
    expect(lines[1]).toMatch(/\| -{3,} \| -{3,} \|/)
  })

  it('left / center / right alignment markers', () => {
    expect(toMarkdown(t([['a'], ['1']]), { align: 'left', pretty: false })).toContain(':--')
    expect(toMarkdown(t([['a'], ['1']]), { align: 'right', pretty: false })).toContain('--:')
    expect(toMarkdown(t([['a'], ['1']]), { align: 'center', pretty: false })).toContain(':-')
  })

  it('escapes pipes and converts newlines to <br>', () => {
    const md = toMarkdown(t([['h'], ['a|b'], ['x\ny']]), { pretty: false })
    expect(md).toContain('a\\|b')
    expect(md).toContain('x<br>y')
  })

  it('pretty mode pads columns to equal width', () => {
    const md = toMarkdown(t([['short', 'x'], ['longer-cell', 'y']]))
    const lines = md.split('\n')
    // 同列的 | 应该竖直对齐：两行长度一致
    expect(lines[0].length).toBe(lines[2].length)
  })

  it('round-trips through parseMarkdown', () => {
    const original = t([['Name', 'Note'], ['Alice', 'likes | pipes'], ['Bob', '']])
    const r = parseMarkdown(toMarkdown(original))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.table.rows).toEqual(original.rows)
  })
})

describe('cellDisplayWidth', () => {
  it('CJK chars count as 2', () => {
    expect(cellDisplayWidth('ab')).toBe(2)
    expect(cellDisplayWidth('中文')).toBe(4)
    expect(cellDisplayWidth('a中')).toBe(3)
  })
})

describe('transpose', () => {
  it('swaps rows and columns', () => {
    const out = transpose(t([['a', 'b', 'c'], ['1', '2', '3']]))
    expect(out.rows).toEqual([['a', '1'], ['b', '2'], ['c', '3']])
  })
  it('pads ragged rows', () => {
    const out = transpose(t([['a', 'b'], ['1']]))
    expect(out.rows).toEqual([['a', '1'], ['b', '']])
  })
  it('empty table stays empty', () => {
    expect(transpose(t([])).rows).toEqual([])
  })
})
