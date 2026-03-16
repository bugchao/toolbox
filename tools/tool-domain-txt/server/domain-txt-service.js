import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

/**
 * 识别 TXT 记录类型
 * @param {string} value - TXT 记录值
 * @returns {string} 记录类型
 */
function identifyTxtType(value) {
  const lowerValue = value.toLowerCase();
  
  if (lowerValue.startsWith('v=spf1')) {
    return 'SPF';
  }
  
  if (lowerValue.includes('dkim') || lowerValue.startsWith('k=rsa') || lowerValue.startsWith('v=dkim1')) {
    return 'DKIM';
  }
  
  if (lowerValue.startsWith('v=dmarc1')) {
    return 'DMARC';
  }
  
  // 常见的域名验证记录
  if (lowerValue.includes('google-site-verification') ||
      lowerValue.includes('ms=') ||
      lowerValue.includes('facebook-domain-verification') ||
      lowerValue.includes('apple-domain-verification')) {
    return 'VERIFICATION';
  }
  
  return 'OTHER';
}

/**
 * 验证 SPF 记录
 * @param {string} value - SPF 记录值
 * @returns {Object} 验证结果
 */
function validateSpf(value) {
  const issues = [];
  
  if (!value.startsWith('v=spf1')) {
    issues.push('SPF 记录必须以 "v=spf1" 开头');
  }
  
  // 检查是否有终止符
  if (!value.includes('~all') && !value.includes('-all') && !value.includes('+all') && !value.includes('?all')) {
    issues.push('SPF 记录应该包含终止符（~all、-all、+all 或 ?all）');
  }
  
  // 检查 DNS 查询次数（简单检查 include 和 a 的数量）
  const includeCount = (value.match(/include:/g) || []).length;
  const aCount = (value.match(/\ba\b/g) || []).length;
  const mxCount = (value.match(/\bmx\b/g) || []).length;
  const totalLookups = includeCount + aCount + mxCount;
  
  if (totalLookups > 10) {
    issues.push(`DNS 查询次数过多（${totalLookups}），SPF 限制为 10 次查询`);
  }
  
  return {
    valid: issues.length === 0,
    issues: issues.length > 0 ? issues : undefined
  };
}

/**
 * 验证 DMARC 记录
 * @param {string} value - DMARC 记录值
 * @returns {Object} 验证结果
 */
function validateDmarc(value) {
  const issues = [];
  
  if (!value.startsWith('v=DMARC1')) {
    issues.push('DMARC 记录必须以 "v=DMARC1" 开头');
  }
  
  if (!value.includes('p=')) {
    issues.push('DMARC 记录必须包含策略（p=none/quarantine/reject）');
  }
  
  if (!value.includes('rua=')) {
    issues.push('建议配置聚合报告地址（rua=）');
  }
  
  return {
    valid: issues.length === 0,
    issues: issues.length > 0 ? issues : undefined
  };
}

/**
 * 查询 TXT 记录
 * @param {string} domain - 域名
 * @returns {Promise<Object>} TXT 记录结果
 */
export async function queryTxtRecords(domain) {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Invalid domain');
  }

  const cleanDomain = domain.trim().toLowerCase();
  
  if (!cleanDomain) {
    throw new Error('Domain is required');
  }

  try {
    // 查询 TXT 记录
    const txtRecords = await resolveTxt(cleanDomain);
    
    if (!txtRecords || txtRecords.length === 0) {
      return {
        domain: cleanDomain,
        txtRecords: [],
        hasTxt: false,
        timestamp: new Date().toISOString()
      };
    }

    // 处理每条 TXT 记录
    const processedRecords = txtRecords.map(record => {
      // TXT 记录可能是字符串数组，需要合并
      const value = Array.isArray(record) ? record.join('') : record;
      const type = identifyTxtType(value);
      
      let validation = { valid: undefined, issues: undefined };
      
      // 根据类型进行验证
      if (type === 'SPF') {
        validation = validateSpf(value);
      } else if (type === 'DMARC') {
        validation = validateDmarc(value);
      }
      
      return {
        value,
        type,
        valid: validation.valid,
        issues: validation.issues
      };
    });

    // 统计各类型记录数量
    const summary = {
      total: processedRecords.length,
      spf: processedRecords.filter(r => r.type === 'SPF').length,
      dkim: processedRecords.filter(r => r.type === 'DKIM').length,
      dmarc: processedRecords.filter(r => r.type === 'DMARC').length,
      verification: processedRecords.filter(r => r.type === 'VERIFICATION').length,
      other: processedRecords.filter(r => r.type === 'OTHER').length
    };

    return {
      domain: cleanDomain,
      txtRecords: processedRecords,
      hasTxt: true,
      timestamp: new Date().toISOString(),
      summary
    };
  } catch (error) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return {
        domain: cleanDomain,
        txtRecords: [],
        hasTxt: false,
        timestamp: new Date().toISOString()
      };
    }

    throw new Error(error.message || 'TXT query failed');
  }
}
