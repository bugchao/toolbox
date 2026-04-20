/**
 * 国际化完整性检查脚本
 * 
 * 功能：
 * 1. 扫描所有工具配置文件，提取 nameKey
 * 2. 检查 zh.json 和 en.json 中是否存在对应翻译
 * 3. 生成缺失翻译的报告和补丁文件
 * 
 * 使用：
 * node scripts/check-i18n-completeness.js [--fix]
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '../apps/web/src/config');
const LOCALE_DIR = path.join(__dirname, '../apps/web/src/locales');
const ZH_FILE = path.join(LOCALE_DIR, 'zh.json');
const EN_FILE = path.join(LOCALE_DIR, 'en.json');

// 从配置文件中提取所有 nameKey
function extractNameKeys() {
  const nameKeys = new Set();
  const configFiles = fs.readdirSync(CONFIG_DIR).filter(f => f.endsWith('.ts'));
  
  for (const file of configFiles) {
    const content = fs.readFileSync(path.join(CONFIG_DIR, file), 'utf8');
    const matches = content.matchAll(/nameKey:\s*['"]([^'"]+)['"]/g);
    for (const match of matches) {
      nameKeys.add(match[1]);
    }
  }
  
  return Array.from(nameKeys).sort();
}

// 读取翻译文件
function loadTranslations(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(content);
  
  // 提取 nav.tools 下的所有键
  const tools = json.nav?.tools || {};
  return new Set(Object.keys(tools).map(k => `tools.${k}`));
}

// 生成缺失翻译的建议
function generateSuggestions(nameKey) {
  // 从 nameKey 生成中英文建议
  const toolName = nameKey.replace('tools.', '');
  
  // 简单的命名转换规则
  const words = toolName.split('_');
  const zhSuggestions = {
    'dns': 'DNS',
    'ip': 'IP',
    'api': 'API',
    'http': 'HTTP',
    'ssl': 'SSL',
    'tcp': 'TCP',
    'udp': 'UDP',
    'url': 'URL',
    'json': 'JSON',
    'xml': 'XML',
    'csv': 'CSV',
    'pdf': 'PDF',
    'qr': '二维码',
    'qrcode': '二维码',
    'image': '图片',
    'color': '颜色',
    'text': '文本',
    'code': '代码',
    'password': '密码',
    'hash': '哈希',
    'base64': 'Base64',
    'timestamp': '时间戳',
    'uuid': 'UUID',
    'regex': '正则',
    'cron': 'Cron',
    'query': '查询',
    'checker': '检测',
    'validator': '验证',
    'generator': '生成器',
    'converter': '转换器',
    'formatter': '格式化',
    'encoder': '编码',
    'decoder': '解码',
    'compressor': '压缩',
    'calculator': '计算器',
    'analyzer': '分析',
    'monitor': '监控',
    'scanner': '扫描',
    'tester': '测试',
    'viewer': '查看器',
    'editor': '编辑器',
    'remover': '移除',
    'filter': '滤镜',
    'watermark': '水印',
    'stitcher': '拼接',
    'cropper': '裁剪',
    'rotator': '旋转',
  };
  
  const zhWords = words.map(w => zhSuggestions[w] || w);
  const enWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1));
  
  return {
    zh: zhWords.join(''),
    en: enWords.join(' ')
  };
}

// 主函数
function main() {
  const shouldFix = process.argv.includes('--fix');
  
  console.log('🔍 扫描工具配置文件...\n');
  const allNameKeys = extractNameKeys();
  console.log(`✅ 找到 ${allNameKeys.length} 个工具\n`);
  
  console.log('📖 读取翻译文件...\n');
  const zhTranslations = loadTranslations(ZH_FILE);
  const enTranslations = loadTranslations(EN_FILE);
  
  console.log(`✅ 中文翻译: ${zhTranslations.size} 个`);
  console.log(`✅ 英文翻译: ${enTranslations.size} 个\n`);
  
  // 找出缺失的翻译
  const missingZh = allNameKeys.filter(k => !zhTranslations.has(k));
  const missingEn = allNameKeys.filter(k => !enTranslations.has(k));
  
  console.log('❌ 缺失的翻译:\n');
  console.log(`中文: ${missingZh.length} 个`);
  console.log(`英文: ${missingEn.length} 个\n`);
  
  if (missingZh.length === 0 && missingEn.length === 0) {
    console.log('✅ 所有翻译都已完整！');
    return;
  }
  
  // 生成补丁
  const patches = {
    zh: {},
    en: {}
  };
  
  for (const nameKey of missingZh) {
    const toolKey = nameKey.replace('tools.', '');
    const suggestion = generateSuggestions(nameKey);
    patches.zh[toolKey] = suggestion.zh;
  }
  
  for (const nameKey of missingEn) {
    const toolKey = nameKey.replace('tools.', '');
    const suggestion = generateSuggestions(nameKey);
    patches.en[toolKey] = suggestion.en;
  }
  
  // 输出补丁预览
  console.log('📝 生成的翻译补丁预览:\n');
  console.log('=== 中文 (zh.json) ===');
  console.log(JSON.stringify(patches.zh, null, 2).split('\n').slice(0, 20).join('\n'));
  if (Object.keys(patches.zh).length > 10) {
    console.log(`... 还有 ${Object.keys(patches.zh).length - 10} 个\n`);
  }
  
  console.log('\n=== 英文 (en.json) ===');
  console.log(JSON.stringify(patches.en, null, 2).split('\n').slice(0, 20).join('\n'));
  if (Object.keys(patches.en).length > 10) {
    console.log(`... 还有 ${Object.keys(patches.en).length - 10} 个\n`);
  }
  
  // 保存补丁文件
  const patchDir = path.join(__dirname, '../.i18n-patches');
  if (!fs.existsSync(patchDir)) {
    fs.mkdirSync(patchDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(patchDir, 'missing-zh.json'),
    JSON.stringify(patches.zh, null, 2)
  );
  fs.writeFileSync(
    path.join(patchDir, 'missing-en.json'),
    JSON.stringify(patches.en, null, 2)
  );
  
  console.log(`\n💾 补丁文件已保存到: ${patchDir}`);
  console.log('   - missing-zh.json');
  console.log('   - missing-en.json\n');
  
  if (shouldFix) {
    console.log('🔧 应用补丁到翻译文件...\n');
    applyPatches(patches);
    console.log('✅ 补丁已应用！请检查并提交更改。\n');
  } else {
    console.log('💡 提示: 使用 --fix 参数自动应用补丁\n');
    console.log('   node scripts/check-i18n-completeness.js --fix\n');
  }
}

// 应用补丁到翻译文件
function applyPatches(patches) {
  // 读取现有翻译
  const zhJson = JSON.parse(fs.readFileSync(ZH_FILE, 'utf8'));
  const enJson = JSON.parse(fs.readFileSync(EN_FILE, 'utf8'));
  
  // 合并补丁
  if (!zhJson.nav) zhJson.nav = {};
  if (!zhJson.nav.tools) zhJson.nav.tools = {};
  Object.assign(zhJson.nav.tools, patches.zh);
  
  if (!enJson.nav) enJson.nav = {};
  if (!enJson.nav.tools) enJson.nav.tools = {};
  Object.assign(enJson.nav.tools, patches.en);
  
  // 排序键（保持一致性）
  zhJson.nav.tools = Object.keys(zhJson.nav.tools).sort().reduce((acc, key) => {
    acc[key] = zhJson.nav.tools[key];
    return acc;
  }, {});
  
  enJson.nav.tools = Object.keys(enJson.nav.tools).sort().reduce((acc, key) => {
    acc[key] = enJson.nav.tools[key];
    return acc;
  }, {});
  
  // 写回文件
  fs.writeFileSync(ZH_FILE, JSON.stringify(zhJson, null, 2) + '\n');
  fs.writeFileSync(EN_FILE, JSON.stringify(enJson, null, 2) + '\n');
}

main();
