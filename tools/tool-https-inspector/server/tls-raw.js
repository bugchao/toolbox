import net from 'net';
import crypto from 'crypto';

// 手写 TLS/TLCP 报文：Node 标准库不支持国密(SM2)套件与后量子(ML-KEM)混合组，
// 只能自行构造 ClientHello 并解析 ServerHello，得出「支持/不支持」级别结论。

const u16 = (n) => Buffer.from([(n >> 8) & 0xff, n & 0xff]);
const u24 = (n) => Buffer.from([(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);

// TLS 1.3 HelloRetryRequest 的固定 random 值（RFC 8446 §4.1.3）
const HRR_RANDOM = Buffer.from(
  'cf21ad74e59a6111be1d8c021e65b891c2a2116717abb8c5e079e09e2c8a8339',
  'hex',
);

/** server_name(SNI) 扩展 */
function sniExtension(host) {
  const name = Buffer.from(host, 'ascii');
  const entry = Buffer.concat([Buffer.from([0x00]), u16(name.length), name]);
  const list = Buffer.concat([u16(entry.length), entry]);
  return Buffer.concat([u16(0x0000), u16(list.length), list]);
}

/** 通用扩展封装 */
function extension(type, data) {
  return Buffer.concat([u16(type), u16(data.length), data]);
}

/**
 * 构造完整的 ClientHello 记录。
 * @param {{recordVersion:number, clientVersion:number, cipherSuites:number[], extensions:Buffer[]}} opts
 */
export function buildClientHello({ recordVersion, clientVersion, cipherSuites, extensions = [] }) {
  const random = crypto.randomBytes(32);
  const sessionId = Buffer.from([0x00]); // 空 session id
  const suites = Buffer.concat(cipherSuites.map(u16));
  const suitesBlock = Buffer.concat([u16(suites.length), suites]);
  const compression = Buffer.from([0x01, 0x00]); // null 压缩
  const extData = Buffer.concat(extensions);
  const extBlock = extensions.length ? Buffer.concat([u16(extData.length), extData]) : Buffer.alloc(0);

  const body = Buffer.concat([u16(clientVersion), random, sessionId, suitesBlock, compression, extBlock]);
  const handshake = Buffer.concat([Buffer.from([0x01]), u24(body.length), body]);
  return Buffer.concat([Buffer.from([0x16]), u16(recordVersion), u16(handshake.length), handshake]);
}

/** 国密 TLCP ClientHello（version 0x0101，携带 SM2 系列套件） */
export function buildGmClientHello(host) {
  return buildClientHello({
    recordVersion: 0x0101,
    clientVersion: 0x0101,
    // ECDHE_SM4_CBC_SM3, ECC_SM4_CBC_SM3, ECDHE_SM4_GCM_SM3, ECC_SM4_GCM_SM3
    cipherSuites: [0xe011, 0xe013, 0xe019, 0xe015],
    extensions: [sniExtension(host)],
  });
}

/** 后量子 TLS 1.3 ClientHello（supported_groups/key_share 携带 X25519MLKEM768=0x11ec） */
export function buildPqcClientHello(host) {
  // supported_versions: 仅 TLS 1.3
  const supportedVersions = extension(0x002b, Buffer.concat([Buffer.from([0x02]), u16(0x0304)]));
  // supported_groups: X25519MLKEM768, x25519, secp256r1
  const groups = Buffer.concat([0x11ec, 0x001d, 0x0017].map(u16));
  const supportedGroups = extension(0x000a, Buffer.concat([u16(groups.length), groups]));
  // signature_algorithms（TLS 1.3 必需）
  const sigAlgs = Buffer.concat([0x0403, 0x0804, 0x0401, 0x0503, 0x0805, 0x0201].map(u16));
  const signatureAlgorithms = extension(0x000d, Buffer.concat([u16(sigAlgs.length), sigAlgs]));
  // key_share: 只带 x25519 的 32 字节公钥；若服务端偏好 MLKEM 会回 HelloRetryRequest 索要 0x11ec
  const x25519Key = crypto.randomBytes(32);
  const share = Buffer.concat([u16(0x001d), u16(x25519Key.length), x25519Key]);
  const keyShare = extension(0x0033, Buffer.concat([u16(share.length), share]));

  return buildClientHello({
    recordVersion: 0x0301,
    clientVersion: 0x0303,
    cipherSuites: [0x1301, 0x1302, 0x1303], // TLS_AES_128_GCM_SHA256 等
    extensions: [sniExtension(host), supportedVersions, supportedGroups, signatureAlgorithms, keyShare],
  });
}

/**
 * 解析服务端返回的字节流，取第一条 ServerHello 或 Alert。
 * @param {Buffer} buf
 * @returns {{type:'server_hello'|'alert'|'incomplete', ...}}
 */
export function parseServerHello(buf) {
  let offset = 0;
  while (offset + 5 <= buf.length) {
    const recordType = buf[offset];
    const len = buf.readUInt16BE(offset + 3);
    const payload = buf.subarray(offset + 5, offset + 5 + len);

    if (recordType === 0x15) {
      return { type: 'alert', level: payload[0], description: payload[1] };
    }
    if (recordType === 0x16 && payload[0] === 0x02) {
      return parseServerHelloBody(payload);
    }
    offset += 5 + len;
  }
  return { type: 'incomplete' };
}

function parseServerHelloBody(payload) {
  const bodyLen = (payload[1] << 16) | (payload[2] << 8) | payload[3];
  const body = payload.subarray(4, 4 + bodyLen);
  let p = 0;
  const version = body.readUInt16BE(p); p += 2;
  const random = body.subarray(p, p + 32); p += 32;
  const isHRR = random.equals(HRR_RANDOM);
  const sidLen = body[p]; p += 1; p += sidLen;
  const cipherSuite = body.readUInt16BE(p); p += 2;
  p += 1; // compression method

  let selectedGroup = null;
  let supportedVersion = null;
  if (p + 2 <= body.length) {
    const extLen = body.readUInt16BE(p); p += 2;
    const extEnd = Math.min(p + extLen, body.length);
    while (p + 4 <= extEnd) {
      const etype = body.readUInt16BE(p); p += 2;
      const elen = body.readUInt16BE(p); p += 2;
      const edata = body.subarray(p, p + elen); p += elen;
      if (etype === 0x0033 && edata.length >= 2) selectedGroup = edata.readUInt16BE(0);
      else if (etype === 0x002b && edata.length >= 2) supportedVersion = edata.readUInt16BE(0);
    }
  }
  return { type: 'server_hello', isHRR, version, cipherSuite, selectedGroup, supportedVersion };
}

/**
 * 建立原始 TCP 连接，发送 ClientHello，收集响应直到拿到 ServerHello/Alert 或超时。
 * @returns {Promise<Buffer>} 服务端返回的原始字节
 */
export function probeRaw(host, port, clientHello, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const socket = net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      chunks.length ? resolve(Buffer.concat(chunks)) : reject(new Error('连接超时'));
    }, timeout);

    socket.on('connect', () => socket.write(clientHello));
    socket.on('data', (d) => {
      chunks.push(d);
      const buf = Buffer.concat(chunks);
      // 拿到一条完整的 ServerHello/Alert 记录即可停止
      const parsed = parseServerHello(buf);
      if (parsed.type !== 'incomplete') {
        clearTimeout(timer);
        socket.destroy();
        resolve(buf);
      }
    });
    socket.on('error', (err) => {
      clearTimeout(timer);
      chunks.length ? resolve(Buffer.concat(chunks)) : reject(err);
    });
    socket.on('end', () => {
      clearTimeout(timer);
      chunks.length ? resolve(Buffer.concat(chunks)) : reject(new Error('连接被关闭'));
    });
  });
}

export const GM_CIPHER_NAMES = {
  0xe011: 'ECDHE_SM4_CBC_SM3',
  0xe013: 'ECC_SM4_CBC_SM3',
  0xe019: 'ECDHE_SM4_GCM_SM3',
  0xe015: 'ECC_SM4_GCM_SM3',
};

/** 判断某个 cipher suite 是否属于国密范围（0xe0xx） */
export function isGmCipher(suite) {
  return suite != null && (suite & 0xff00) === 0xe000;
}

export const PQC_GROUP_NAMES = {
  0x11ec: 'X25519MLKEM768',
  0x6399: 'X25519Kyber768Draft00',
};

/** 判断某个 named group 是否属于后量子混合组 */
export function isPqcGroup(group) {
  return group === 0x11ec || group === 0x6399;
}

/**
 * 探测错误分类：服务端收到我们的 ClientHello 后主动重置连接（RST/EPIPE/关闭），
 * 属于「不支持该协议」的正常信号；而超时、DNS 失败、拒绝连接则是无法判定的真实错误。
 * @returns {'not-supported'|'error'}
 */
export function classifyProbeError(err) {
  const code = err?.code || '';
  const msg = err?.message || '';
  if (code === 'ECONNRESET' || code === 'EPIPE' || /reset|被关闭|closed/i.test(msg)) {
    return 'not-supported';
  }
  return 'error';
}
