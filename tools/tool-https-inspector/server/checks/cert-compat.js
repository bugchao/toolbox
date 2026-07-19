// 已被主流平台/浏览器移除信任的历史根 CA（近似规则，非详尽名单）
const DISTRUSTED_ROOTS = ['symantec', 'wosign', 'startcom', 'certinomis'];

const PLATFORMS = ['android', 'ios', 'macos', 'windows', 'browsers', 'java'];

/**
 * 纯函数：基于根 CA / 签名算法 / 公钥强度推断各平台的证书信任情况。
 * 推断结果，非真实多平台验证——依据公开的信任库变更历史与最低强度要求。
 */
export function inferCompatibility({ rootCA = '', sigAlg = '', keyBits = 0 } = {}) {
  const root = String(rootCA).toLowerCase();
  const sig = String(sigAlg).toLowerCase();
  const bits = Number(keyBits) || 0;

  const reasons = [];
  let baseline = 'trusted';

  if (DISTRUSTED_ROOTS.some((d) => root.includes(d))) {
    baseline = 'untrusted';
    reasons.push(`根 CA「${rootCA}」已被主流平台移除信任`);
  }
  if (/sha1/.test(sig)) {
    baseline = 'untrusted';
    reasons.push('签名算法使用已弃用的 SHA-1');
  }
  if (bits > 0 && bits < 2048) {
    baseline = 'untrusted';
    reasons.push(`公钥强度 ${bits} bit 低于 2048 bit 最低要求`);
  }

  const platforms = PLATFORMS.map((id) => ({ id, status: baseline, reasons: [...reasons] }));

  if (baseline === 'trusted' && /isrg|let's encrypt|internet security research group/i.test(root)) {
    const android = platforms.find((p) => p.id === 'android');
    android.status = 'unknown';
    android.reasons.push('ISRG Root X1 的旧版 Android 交叉签名已于 2024 年 9 月过期，Android 7.1.1 以下版本可能不信任此证书');
  }

  return { platforms, baseline };
}

/** 证书兼容性测试：基于证书信息推断各平台信任情况。 */
export async function checkCertCompat({ rootCA, sigAlg, keyBits }) {
  try {
    const { platforms, baseline } = inferCompatibility({ rootCA, sigAlg, keyBits });
    return { ok: true, platforms, baseline };
  } catch (err) {
    return { ok: false, error: err.message || '检测失败' };
  }
}
