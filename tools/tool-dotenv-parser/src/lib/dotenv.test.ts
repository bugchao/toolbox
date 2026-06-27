import { describe, it, expect } from 'vitest'
import {
  parseDotenv,
  parseJsonObject,
  toJson,
  toYaml,
  toShell,
  toEnv,
  serialize,
} from './dotenv'

const find = (entries: ReturnType<typeof parseDotenv>['entries'], key: string) =>
  entries.find((e) => e.key === key)

describe('parseDotenv — 基础', () => {
  it('解析简单 KEY=VALUE', () => {
    const r = parseDotenv('FOO=bar')
    expect(r.entries).toHaveLength(1)
    expect(find(r.entries, 'FOO')?.value).toBe('bar')
    expect(r.stats.total).toBe(1)
  })

  it('忽略注释行与空行并统计', () => {
    const r = parseDotenv('# comment\n\nA=1\n  \n# another\nB=2')
    expect(r.stats.total).toBe(2)
    expect(r.stats.comments).toBe(2)
    expect(r.stats.blanks).toBe(2)
  })

  it('处理等号两侧空白', () => {
    const r = parseDotenv('  KEY  =  value  ')
    expect(find(r.entries, 'KEY')?.value).toBe('value')
  })

  it('处理空值', () => {
    const r = parseDotenv('EMPTY=')
    expect(find(r.entries, 'EMPTY')?.value).toBe('')
  })
})

describe('parseDotenv — 引号与转义', () => {
  it('双引号值', () => {
    const r = parseDotenv('A="hello world"')
    const e = find(r.entries, 'A')
    expect(e?.value).toBe('hello world')
    expect(e?.quoted).toBe('double')
  })

  it('双引号内转义 \\n \\t', () => {
    const r = parseDotenv('MSG="line1\\nline2\\tend"')
    expect(find(r.entries, 'MSG')?.value).toBe('line1\nline2\tend')
  })

  it('单引号值不做转义', () => {
    const r = parseDotenv("A='raw\\ntext'")
    const e = find(r.entries, 'A')
    expect(e?.value).toBe('raw\\ntext')
    expect(e?.quoted).toBe('single')
  })

  it('双引号内 # 不当注释', () => {
    const r = parseDotenv('A="a # b"')
    expect(find(r.entries, 'A')?.value).toBe('a # b')
  })
})

describe('parseDotenv — 行内注释', () => {
  it('未加引号且空格 + # 视为行内注释', () => {
    const r = parseDotenv('A=value # trailing comment')
    expect(find(r.entries, 'A')?.value).toBe('value')
  })

  it('值内紧贴的 # 不当注释', () => {
    const r = parseDotenv('A=val#ue')
    expect(find(r.entries, 'A')?.value).toBe('val#ue')
  })
})

describe('parseDotenv — export 前缀', () => {
  it('去掉 export 前缀', () => {
    const r = parseDotenv('export PATH_X=/usr/bin')
    const e = find(r.entries, 'PATH_X')
    expect(e?.value).toBe('/usr/bin')
    expect(e?.hadExport).toBe(true)
  })
})

describe('parseDotenv — 校验', () => {
  it('检测重复 key', () => {
    const r = parseDotenv('A=1\nA=2')
    expect(r.issues.some((i) => i.type === 'duplicate' && i.key === 'A')).toBe(true)
  })

  it('检测非法 key', () => {
    const r = parseDotenv('1BAD=x\nBAD-KEY=y')
    const invalid = r.issues.filter((i) => i.type === 'invalid-key')
    expect(invalid).toHaveLength(2)
  })

  it('检测空 key', () => {
    const r = parseDotenv('=value')
    expect(r.issues.some((i) => i.type === 'empty-key')).toBe(true)
  })

  it('检测可疑未加引号含空格的值', () => {
    const r = parseDotenv('A=hello world')
    expect(r.issues.some((i) => i.type === 'suspicious-unquoted')).toBe(true)
  })

  it('缺少等号报告 no-equals', () => {
    const r = parseDotenv('JUST_TEXT')
    expect(r.issues.some((i) => i.type === 'no-equals')).toBe(true)
  })
})

describe('parseJsonObject — 反向输入', () => {
  it('解析 JSON 对象', () => {
    const r = parseJsonObject('{"A":"1","B":"two"}')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.result.entries).toHaveLength(2)
  })

  it('数字/布尔/null 转换', () => {
    const r = parseJsonObject('{"N":42,"B":true,"X":null}')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(find(r.result.entries, 'N')?.value).toBe('42')
      expect(find(r.result.entries, 'B')?.value).toBe('true')
      expect(find(r.result.entries, 'X')?.value).toBe('')
    }
  })

  it('拒绝数组与非对象', () => {
    expect(parseJsonObject('[1,2]').ok).toBe(false)
    expect(parseJsonObject('"str"').ok).toBe(false)
  })

  it('拒绝非法 JSON', () => {
    expect(parseJsonObject('{bad}').ok).toBe(false)
  })
})

describe('序列化输出', () => {
  const entries = parseDotenv('A=1\nB="hello world"\nC=plain').entries

  it('toJson', () => {
    expect(JSON.parse(toJson(entries))).toEqual({ A: '1', B: 'hello world', C: 'plain' })
  })

  it('toYaml 对数字样字符串加引号、普通标量不加', () => {
    const y = toYaml(entries)
    expect(y).toContain('A: "1"')
    expect(y).toContain('B: hello world')
    expect(y).toContain('C: plain')
  })

  it('toYaml 对含特殊字符的值加引号', () => {
    const e = parseDotenv('URL=http://x:8080 # c').entries
    expect(toYaml(e)).toBe('URL: "http://x:8080"')
  })

  it('toYaml 对布尔样字符串加引号', () => {
    const e = parseDotenv('FLAG=true').entries
    expect(toYaml(e)).toBe('FLAG: "true"')
  })

  it('toShell 生成 export 并转义', () => {
    const e = parseDotenv('A=a$b"c').entries
    expect(toShell(e)).toBe('export A="a\\$b\\"c"')
  })

  it('toEnv 规范化并对含空格的值加引号', () => {
    expect(toEnv(entries)).toBe('A=1\nB="hello world"\nC=plain')
  })

  it('toEnv 转义换行', () => {
    const e = parseDotenv('M="x\\ny"').entries
    expect(toEnv(e)).toBe('M="x\\ny"')
  })

  it('去重时后写覆盖先写', () => {
    const e = parseDotenv('A=1\nA=2').entries
    expect(JSON.parse(toJson(e))).toEqual({ A: '2' })
  })

  it('serialize 分派各格式', () => {
    expect(serialize(entries, 'json')).toBe(toJson(entries))
    expect(serialize(entries, 'yaml')).toBe(toYaml(entries))
    expect(serialize(entries, 'shell')).toBe(toShell(entries))
    expect(serialize(entries, 'env')).toBe(toEnv(entries))
  })
})

describe('往返一致性', () => {
  it('.env → JSON → .env 保持键值', () => {
    const src = 'export FOO=bar\nBAZ="qux quux"\nEMPTY='
    const parsed = parseDotenv(src)
    const json = toJson(parsed.entries)
    const back = parseJsonObject(json)
    expect(back.ok).toBe(true)
    if (back.ok) {
      expect(find(back.result.entries, 'FOO')?.value).toBe('bar')
      expect(find(back.result.entries, 'BAZ')?.value).toBe('qux quux')
      expect(find(back.result.entries, 'EMPTY')?.value).toBe('')
    }
  })
})
