// RFC 8484 (DNS-over-HTTPS) binary wire format — for DoH servers that only implement
// the standard `application/dns-message` protocol (e.g. self-hosted / generic DoH
// proxies), as opposed to the Google/Cloudflare-style JSON API in `json.ts`.

const TYPE_CODES: Record<string, number> = { A: 1, NS: 2, CNAME: 5, MX: 15, TXT: 16, AAAA: 28 }
const TYPE_NAMES: Record<number, string> = Object.fromEntries(Object.entries(TYPE_CODES).map(([k, v]) => [v, k]))
const decoder = new TextDecoder()

function encodeName(name: string): number[] {
  const bytes: number[] = []
  for (const label of name.split('.')) {
    if (label.length === 0) continue
    // ponytail: no punycode/IDN support — reject rather than silently truncate
    // (charCodeAt → Uint8Array would mod-256 any non-ASCII code point into a
    // different, wrong label instead of throwing).
    if (!/^[\x00-\x7f]*$/.test(label)) throw new Error(`DNS label is not ASCII (IDN needs punycode first): "${label}"`)
    if (label.length > 63) throw new Error(`DNS label exceeds 63 bytes: "${label}"`)
    bytes.push(label.length)
    for (let i = 0; i < label.length; i++) bytes.push(label.charCodeAt(i))
  }
  bytes.push(0)
  return bytes
}

export function buildDnsQuery(domain: string, type: string): Uint8Array {
  const qtype = TYPE_CODES[type] ?? TYPE_CODES.A
  const id = Math.floor(Math.random() * 0x10000)
  const header = [
    (id >> 8) & 0xff, id & 0xff,
    0x01, 0x00, // flags: RD=1 (recursion desired)
    0x00, 0x01, // QDCOUNT=1
    0x00, 0x00, // ANCOUNT
    0x00, 0x00, // NSCOUNT
    0x00, 0x00, // ARCOUNT
  ]
  const question = [...encodeName(domain), (qtype >> 8) & 0xff, qtype & 0xff, 0x00, 0x01] // QCLASS=IN
  return new Uint8Array([...header, ...question])
}

function readUint16(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1]
}

// Follows RFC 1035 §4.1.4 message-compression pointers; `guard` bounds pointer
// chains so a malformed/malicious response can't loop forever.
function readName(bytes: Uint8Array, offset: number): { name: string; next: number } {
  const labels: string[] = []
  let pos = offset
  let jumped = false
  let afterPointer = offset
  for (let guard = 0; guard < 128; guard++) {
    const len = bytes[pos]
    if (len === undefined || len === 0) {
      pos += 1
      if (!jumped) afterPointer = pos
      break
    }
    if ((len & 0xc0) === 0xc0) {
      if (!jumped) afterPointer = pos + 2
      pos = ((len & 0x3f) << 8) | bytes[pos + 1]
      jumped = true
      continue
    }
    labels.push(String.fromCharCode(...bytes.slice(pos + 1, pos + 1 + len)))
    pos += 1 + len
  }
  return { name: labels.join('.') + '.', next: jumped ? afterPointer : pos }
}

function formatRdata(bytes: Uint8Array, type: number, rdataOffset: number, rdlength: number): string {
  if (type === TYPE_CODES.A && rdlength === 4) {
    return Array.from(bytes.slice(rdataOffset, rdataOffset + 4)).join('.')
  }
  if (type === TYPE_CODES.AAAA && rdlength === 16) {
    const groups: string[] = []
    for (let i = 0; i < 16; i += 2) groups.push(readUint16(bytes, rdataOffset + i).toString(16))
    return groups.join(':')
  }
  if (type === TYPE_CODES.CNAME || type === TYPE_CODES.NS) {
    return readName(bytes, rdataOffset).name
  }
  if (type === TYPE_CODES.MX && rdlength >= 2) {
    const preference = readUint16(bytes, rdataOffset)
    return `${preference} ${readName(bytes, rdataOffset + 2).name}`
  }
  if (type === TYPE_CODES.TXT) {
    let pos = rdataOffset
    const end = rdataOffset + rdlength
    const parts: string[] = []
    while (pos < end) {
      const len = bytes[pos]
      parts.push(decoder.decode(bytes.slice(pos + 1, pos + 1 + len)))
      pos += 1 + len
    }
    return parts.join('')
  }
  return Array.from(bytes.slice(rdataOffset, rdataOffset + rdlength))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function parseDnsMessage(bytes: Uint8Array): string[] {
  if (bytes.length < 12) return []
  const rcode = bytes[3] & 0x0f
  if (rcode !== 0) return []

  const qdcount = readUint16(bytes, 4)
  const ancount = readUint16(bytes, 6)

  let offset = 12
  for (let i = 0; i < qdcount; i++) {
    offset = readName(bytes, offset).next
    offset += 4 // QTYPE + QCLASS
  }

  const answers: string[] = []
  for (let i = 0; i < ancount; i++) {
    offset = readName(bytes, offset).next
    const type = readUint16(bytes, offset)
    offset += 8 // TYPE(2) + CLASS(2) + TTL(4)
    const rdlength = readUint16(bytes, offset)
    offset += 2
    if (TYPE_NAMES[type]) {
      answers.push(formatRdata(bytes, type, offset, rdlength))
    }
    offset += rdlength
  }
  return answers
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function queryDohWire(url: string, domain: string, type: string): Promise<{ ms: number; answers: string[] }> {
  const query = buildDnsQuery(domain, type)
  const dnsParam = toBase64Url(query)
  const start = performance.now()
  const response = await fetch(`${url}?dns=${dnsParam}`, { headers: { Accept: 'application/dns-message' } })
  const ms = Math.round(performance.now() - start)
  const bytes = new Uint8Array(await response.arrayBuffer())
  return { ms, answers: parseDnsMessage(bytes) }
}
