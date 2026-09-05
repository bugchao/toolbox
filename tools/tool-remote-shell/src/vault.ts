/**
 * 浏览器端凭据金库。
 *
 * 边界：主密码派生的密钥只活在标签页内存里，密文存 localStorage，
 * 明文密码 / 私钥**永远不发给本站服务端**，只在建立 SSH 连接的首帧发给
 * 网关，网关建连后立刻丢弃。服务端不落盘、不写日志。
 */

const STORAGE_KEY = 'toolbox.remote-shell.vault.v1';
const HOSTKEY_KEY = 'toolbox.remote-shell.hostkeys.v1';

// OWASP 2023 对 PBKDF2-SHA256 的建议下限
const PBKDF2_ITERATIONS = 310_000;

export type AuthType = 'password' | 'key';

export interface HostEntry {
  id: string;
  alias: string;
  host: string;
  port: number;
  user: string;
  authType: AuthType;
  /** 密码，或私钥全文 */
  secret: string;
  /** 私钥口令，仅 authType==='key' 时有意义 */
  passphrase?: string;
}

export interface VaultBlob {
  v: 1;
  iterations: number;
  salt: string;
  iv: string;
  ct: string;
}

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function deriveKey(
  masterPassword: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptVault(
  entries: HostEntry[],
  masterPassword: string,
): Promise<VaultBlob> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterPassword, salt, PBKDF2_ITERATIONS);
  const plaintext = new TextEncoder().encode(JSON.stringify(entries));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    plaintext,
  );
  return {
    v: 1,
    iterations: PBKDF2_ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ct: toBase64(ct),
  };
}

export async function decryptVault(
  blob: VaultBlob,
  masterPassword: string,
): Promise<HostEntry[]> {
  const salt = fromBase64(blob.salt);
  const iv = fromBase64(blob.iv);
  const key = await deriveKey(masterPassword, salt, blob.iterations ?? PBKDF2_ITERATIONS);
  // 主密码错误时 AES-GCM 的认证标签校验会失败并抛错，这正是我们要的行为：
  // 不需要额外存校验值，密文本身就是校验。
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    fromBase64(blob.ct) as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as HostEntry[];
}

export function loadVaultBlob(): VaultBlob | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VaultBlob) : null;
  } catch {
    return null;
  }
}

export function saveVaultBlob(blob: VaultBlob): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
  } catch {
    /* 隐私模式下写不进去，功能降级为「本次不保存」 */
  }
}

export function clearVault(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* 同上 */
  }
}

export function hasVault(): boolean {
  return loadVaultBlob() !== null;
}

/* ---------- host key TOFU ---------- */
/* 指纹不是机密，明文存即可；它的作用是「变了要能发现」，不是「不能被看见」 */

type HostKeyMap = Record<string, string>;

function loadHostKeys(): HostKeyMap {
  try {
    const raw = localStorage.getItem(HOSTKEY_KEY);
    return raw ? (JSON.parse(raw) as HostKeyMap) : {};
  } catch {
    return {};
  }
}

export function getKnownHostKey(host: string, port: number): string | null {
  return loadHostKeys()[`${host}:${port}`] ?? null;
}

export function rememberHostKey(host: string, port: number, fingerprint: string): void {
  try {
    const map = loadHostKeys();
    map[`${host}:${port}`] = fingerprint;
    localStorage.setItem(HOSTKEY_KEY, JSON.stringify(map));
  } catch {
    /* 存不下就每次都要确认，安全性不降级 */
  }
}

export function forgetHostKey(host: string, port: number): void {
  try {
    const map = loadHostKeys();
    delete map[`${host}:${port}`];
    localStorage.setItem(HOSTKEY_KEY, JSON.stringify(map));
  } catch {
    /* 忽略 */
  }
}
