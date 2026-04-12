import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const OPENSSL_BIN = process.env.OPENSSL_BIN || 'openssl'
const KEYTOOL_BIN = process.env.KEYTOOL_BIN || 'keytool'

function normalizeContent(content) {
  return typeof content === 'string' ? content.trim() : ''
}

function isPemContent(content) {
  return /-----BEGIN [A-Z0-9 ]+-----/.test(content)
}

function extractPemBlocks(content) {
  return content.match(/-----BEGIN [A-Z0-9 ]+-----[\s\S]*?-----END [A-Z0-9 ]+-----/g) ?? []
}

function getIndentedSection(text, title) {
  const pattern = new RegExp(`${title}:\\s*\\n((?:\\s{4,}.+\\n?)*)`, 'i')
  const match = text.match(pattern)
  if (!match?.[1]) return []

  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function getAllMatches(text, pattern) {
  return Array.from(text.matchAll(pattern)).map((match) => match[1]?.trim()).filter(Boolean)
}

function extractSingle(text, pattern) {
  return text.match(pattern)?.[1]?.trim() ?? ''
}

function parseSanLines(lines) {
  return lines
    .join(' ')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function base64ToBuffer(value) {
  const payload = value.includes(',') ? value.split(',').pop() : value
  return Buffer.from(payload || '', 'base64')
}

async function withTempDir(prefix, run) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  try {
    return await run(dir)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
}

async function runCommand(command, args, timeout = 20000) {
  try {
    return await execFileAsync(command, args, {
      timeout,
      maxBuffer: 20 * 1024 * 1024,
    })
  } catch (error) {
    const detail = [error.stdout, error.stderr, error.message].filter(Boolean).join('\n').trim()
    throw new Error(detail || `Command failed: ${command}`)
  }
}

async function writeMaybeBinary(filePath, content, encoding = 'text') {
  if (encoding === 'base64') {
    await fs.writeFile(filePath, base64ToBuffer(content))
    return
  }

  await fs.writeFile(filePath, content, 'utf8')
}

function summarizeBlocks(content) {
  const blocks = extractPemBlocks(content)
  return {
    blockTypes: blocks.map((block) => block.match(/-----BEGIN ([A-Z0-9 ]+)-----/)?.[1] ?? 'UNKNOWN'),
    blockCount: blocks.length,
  }
}

function parseCsrText(stdout, stderr) {
  const text = [stdout, stderr].filter(Boolean).join('\n')
  const san = parseSanLines(getIndentedSection(text, 'X509v3 Subject Alternative Name'))
  const keyUsage = getIndentedSection(text, 'X509v3 Key Usage')
  const extendedKeyUsage = getIndentedSection(text, 'X509v3 Extended Key Usage')
  const signatureMatches = getAllMatches(text, /Signature Algorithm:\s*([^\n]+)/g)

  return {
    verified: /verify OK/i.test(text),
    subject: extractSingle(text, /Subject:\s*([^\n]+)/),
    subjectAlternativeNames: san,
    publicKeyAlgorithm: extractSingle(text, /Public Key Algorithm:\s*([^\n]+)/),
    publicKeyBits: extractSingle(text, /Public-Key:\s*\((\d+)\s*bit\)/),
    signatureAlgorithm: signatureMatches[0] ?? '',
    keyUsage,
    extendedKeyUsage,
    rawText: text.trim(),
  }
}

function parseCertificateText(text, inputSummary) {
  const signatureMatches = getAllMatches(text, /Signature Algorithm:\s*([^\n]+)/g)
  const san = parseSanLines(getIndentedSection(text, 'X509v3 Subject Alternative Name'))
  const keyUsage = getIndentedSection(text, 'X509v3 Key Usage')
  const extendedKeyUsage = getIndentedSection(text, 'X509v3 Extended Key Usage')
  const basicConstraints = getIndentedSection(text, 'X509v3 Basic Constraints')

  return {
    subject: extractSingle(text, /subject=\s*([^\n]+)/i) || extractSingle(text, /Subject:\s*([^\n]+)/),
    issuer: extractSingle(text, /issuer=\s*([^\n]+)/i) || extractSingle(text, /Issuer:\s*([^\n]+)/),
    serialNumber: extractSingle(text, /serial=([^\n]+)/i) || extractSingle(text, /Serial Number:\s*([^\n]+)/),
    notBefore: extractSingle(text, /notBefore=([^\n]+)/i) || extractSingle(text, /Not Before:\s*([^\n]+)/),
    notAfter: extractSingle(text, /notAfter=([^\n]+)/i) || extractSingle(text, /Not After\s*:\s*([^\n]+)/),
    sha256Fingerprint: extractSingle(text, /sha256 Fingerprint=([^\n]+)/i) || extractSingle(text, /SHA256 Fingerprint=([^\n]+)/i),
    publicKeyAlgorithm: extractSingle(text, /Public Key Algorithm:\s*([^\n]+)/),
    publicKeyBits: extractSingle(text, /Public-Key:\s*\((\d+)\s*bit\)/),
    signatureAlgorithm: signatureMatches[0] ?? '',
    subjectAlternativeNames: san,
    keyUsage,
    extendedKeyUsage,
    basicConstraints,
    blockTypes: inputSummary.blockTypes,
    blockCount: inputSummary.blockCount,
    rawText: text.trim(),
  }
}

export async function inspectCsr(content) {
  const normalized = normalizeContent(content)
  if (!normalized) throw new Error('CSR content is required')
  if (!/BEGIN (NEW )?CERTIFICATE REQUEST/.test(normalized)) {
    throw new Error('请输入 PEM 格式的 CSR 内容')
  }

  return withTempDir('toolbox-csr-', async (dir) => {
    const inputPath = path.join(dir, 'request.csr')
    await fs.writeFile(inputPath, normalized, 'utf8')
    const { stdout, stderr } = await runCommand(OPENSSL_BIN, [
      'req',
      '-in',
      inputPath,
      '-noout',
      '-text',
      '-verify',
    ])

    return parseCsrText(stdout, stderr)
  })
}

export async function inspectCertificate({ content, encoding = 'text' }) {
  const normalized = normalizeContent(content)
  if (!normalized) throw new Error('Certificate content is required')

  return withTempDir('toolbox-cert-', async (dir) => {
    const isPem = encoding === 'text' && isPemContent(normalized)
    const inputPath = path.join(dir, isPem ? 'certificate.pem' : 'certificate.der')

    await writeMaybeBinary(inputPath, normalized, encoding)

    const args = [
      'x509',
      '-in',
      inputPath,
      '-inform',
      isPem ? 'PEM' : 'DER',
      '-noout',
      '-text',
      '-fingerprint',
      '-sha256',
      '-serial',
      '-subject',
      '-issuer',
      '-dates',
    ]

    const { stdout, stderr } = await runCommand(OPENSSL_BIN, args)
    const summary = isPem ? summarizeBlocks(normalized) : { blockTypes: ['DER'], blockCount: 1 }
    return parseCertificateText([stdout, stderr].filter(Boolean).join('\n'), summary)
  })
}

async function extractBundleFromPkcs12(inputPath, sourcePassword, tempDir) {
  const passArg = `pass:${sourcePassword || ''}`
  const certPath = path.join(tempDir, 'cert.pem')
  const keyPath = path.join(tempDir, 'key.pem')

  await runCommand(OPENSSL_BIN, [
    'pkcs12',
    '-in',
    inputPath,
    '-passin',
    passArg,
    '-clcerts',
    '-nokeys',
    '-out',
    certPath,
  ])

  await runCommand(OPENSSL_BIN, [
    'pkcs12',
    '-in',
    inputPath,
    '-passin',
    passArg,
    '-nocerts',
    '-nodes',
    '-out',
    keyPath,
  ])

  const certificatePem = await fs.readFile(certPath, 'utf8')
  const privateKeyPem = await fs.readFile(keyPath, 'utf8')

  return { certificatePem, privateKeyPem, certPath, keyPath }
}

async function normalizePemInputs(tempDir, bundleContent, keyContent) {
  const bundleBlocks = extractPemBlocks(bundleContent)
  const certBlock = bundleBlocks.find((block) => /BEGIN CERTIFICATE/.test(block)) ?? ''
  const keyBlock =
    keyContent ||
    bundleBlocks.find((block) => /BEGIN (?:RSA |EC |ENCRYPTED |PRIVATE KEY)/.test(block)) ||
    bundleBlocks.find((block) => /BEGIN PRIVATE KEY/.test(block)) ||
    ''

  if (!certBlock && !keyBlock) {
    throw new Error('请提供证书或私钥内容')
  }

  const certPath = path.join(tempDir, 'source-cert.pem')
  const keyPath = path.join(tempDir, 'source-key.pem')

  if (certBlock) {
    await fs.writeFile(certPath, certBlock, 'utf8')
  }

  if (keyBlock) {
    await fs.writeFile(keyPath, keyBlock, 'utf8')
  }

  return {
    certPath: certBlock ? certPath : '',
    keyPath: keyBlock ? keyPath : '',
    certificatePem: certBlock,
    privateKeyPem: keyBlock,
  }
}

async function createPkcs12({ certPath, keyPath, outputPath, password, alias }) {
  if (!certPath || !keyPath) {
    throw new Error('生成 PFX/JKS 需要同时提供证书和私钥')
  }

  await runCommand(OPENSSL_BIN, [
    'pkcs12',
    '-export',
    '-in',
    certPath,
    '-inkey',
    keyPath,
    '-out',
    outputPath,
    '-name',
    alias || 'toolbox',
    '-passout',
    `pass:${password || ''}`,
  ])
}

async function pfxToJks({ pfxPath, outputPath, sourcePassword, targetPassword, alias }) {
  const args = [
    '-importkeystore',
    '-srckeystore',
    pfxPath,
    '-srcstoretype',
    'PKCS12',
    '-srcstorepass',
    sourcePassword || '',
    '-destkeystore',
    outputPath,
    '-deststoretype',
    'JKS',
    '-deststorepass',
    targetPassword || sourcePassword || '',
    '-noprompt',
  ]

  if (alias) {
    args.push('-srcalias', alias, '-destalias', alias)
  }

  await runCommand(KEYTOOL_BIN, args)
}

async function jksToPfx({ jksPath, outputPath, sourcePassword, targetPassword, alias }) {
  const args = [
    '-importkeystore',
    '-srckeystore',
    jksPath,
    '-srcstoretype',
    'JKS',
    '-srcstorepass',
    sourcePassword || '',
    '-destkeystore',
    outputPath,
    '-deststoretype',
    'PKCS12',
    '-deststorepass',
    targetPassword || sourcePassword || '',
    '-noprompt',
  ]

  if (alias) {
    args.push('-srcalias', alias, '-destalias', alias)
  }

  await runCommand(KEYTOOL_BIN, args)
}

function toArtifact(name, mimeType, content, encoding = 'text') {
  return { name, mimeType, content, encoding }
}

export async function convertCertificateFormat({
  sourceFormat,
  targetFormat,
  sourceContent = '',
  sourceEncoding = 'text',
  bundleContent = '',
  keyContent = '',
  sourcePassword = '',
  targetPassword = '',
  alias = 'toolbox',
}) {
  if (!sourceFormat || !targetFormat) {
    throw new Error('请选择输入格式和输出格式')
  }

  if (sourceFormat === targetFormat) {
    throw new Error('输入格式和输出格式不能相同')
  }

  return withTempDir('toolbox-convert-', async (dir) => {
    let certPath = ''
    let keyPath = ''
    let certificatePem = ''
    let privateKeyPem = ''
    const notes = []

    if (sourceFormat === 'pem' || sourceFormat === 'pkcs8') {
      const normalized = await normalizePemInputs(dir, bundleContent || sourceContent, keyContent)
      certPath = normalized.certPath
      keyPath = normalized.keyPath
      certificatePem = normalized.certificatePem
      privateKeyPem = normalized.privateKeyPem

      if (sourceFormat === 'pkcs8' && keyPath) {
        const normalizedKeyPath = path.join(dir, 'normalized-key.pem')
        await runCommand(OPENSSL_BIN, ['pkey', '-in', keyPath, '-out', normalizedKeyPath])
        keyPath = normalizedKeyPath
        privateKeyPem = await fs.readFile(keyPath, 'utf8')
      }
    } else if (sourceFormat === 'pfx') {
      const inputPath = path.join(dir, 'source.pfx')
      await writeMaybeBinary(inputPath, sourceContent, sourceEncoding)
      const extracted = await extractBundleFromPkcs12(inputPath, sourcePassword, dir)
      certPath = extracted.certPath
      keyPath = extracted.keyPath
      certificatePem = extracted.certificatePem
      privateKeyPem = extracted.privateKeyPem
      notes.push('已从 PFX 中提取证书和私钥。')
    } else if (sourceFormat === 'jks') {
      const inputPath = path.join(dir, 'source.jks')
      const pfxPath = path.join(dir, 'intermediate.pfx')
      await writeMaybeBinary(inputPath, sourceContent, sourceEncoding)
      await jksToPfx({
        jksPath: inputPath,
        outputPath: pfxPath,
        sourcePassword,
        targetPassword: sourcePassword || targetPassword || 'toolbox',
        alias,
      })
      const extracted = await extractBundleFromPkcs12(
        pfxPath,
        sourcePassword || targetPassword || 'toolbox',
        dir
      )
      certPath = extracted.certPath
      keyPath = extracted.keyPath
      certificatePem = extracted.certificatePem
      privateKeyPem = extracted.privateKeyPem
      notes.push('已通过中间 PFX 从 JKS 中提取证书和私钥。')
    } else {
      throw new Error('暂不支持的输入格式')
    }

    const artifacts = []

    if (targetFormat === 'pem') {
      if (certificatePem) {
        artifacts.push(toArtifact('certificate.pem', 'application/x-pem-file', certificatePem))
      }
      if (keyPath) {
        const normalizedKeyPath = path.join(dir, 'private-key.pem')
        await runCommand(OPENSSL_BIN, ['pkey', '-in', keyPath, '-out', normalizedKeyPath])
        artifacts.push(
          toArtifact(
            'private-key.pem',
            'application/x-pem-file',
            await fs.readFile(normalizedKeyPath, 'utf8')
          )
        )
      }
    } else if (targetFormat === 'pkcs8') {
      if (!keyPath) throw new Error('转换为 PKCS8 需要私钥内容')
      const outputKeyPath = path.join(dir, 'private-key.pk8.pem')
      await runCommand(OPENSSL_BIN, [
        'pkcs8',
        '-topk8',
        '-nocrypt',
        '-in',
        keyPath,
        '-out',
        outputKeyPath,
      ])
      artifacts.push(
        toArtifact(
          'private-key.pk8.pem',
          'application/x-pem-file',
          await fs.readFile(outputKeyPath, 'utf8')
        )
      )
      if (certificatePem) {
        artifacts.push(toArtifact('certificate.pem', 'application/x-pem-file', certificatePem))
      }
    } else if (targetFormat === 'pfx') {
      const outputPath = path.join(dir, 'certificate-bundle.pfx')
      await createPkcs12({
        certPath,
        keyPath,
        outputPath,
        password: targetPassword,
        alias,
      })
      artifacts.push(
        toArtifact(
          'certificate-bundle.pfx',
          'application/x-pkcs12',
          (await fs.readFile(outputPath)).toString('base64'),
          'base64'
        )
      )
    } else if (targetFormat === 'jks') {
      const pfxPath = path.join(dir, 'intermediate-target.pfx')
      const outputPath = path.join(dir, 'certificate-store.jks')
      const password = targetPassword || sourcePassword || 'changeit'
      await createPkcs12({
        certPath,
        keyPath,
        outputPath: pfxPath,
        password,
        alias,
      })
      await pfxToJks({
        pfxPath,
        outputPath,
        sourcePassword: password,
        targetPassword: password,
        alias,
      })
      artifacts.push(
        toArtifact(
          'certificate-store.jks',
          'application/octet-stream',
          (await fs.readFile(outputPath)).toString('base64'),
          'base64'
        )
      )
    } else {
      throw new Error('暂不支持的输出格式')
    }

    return {
      sourceFormat,
      targetFormat,
      artifacts,
      notes,
      hasCertificate: Boolean(certificatePem),
      hasPrivateKey: Boolean(privateKeyPem),
    }
  })
}
