/** 英文 lorem 词库（经典 + 常见扩展）。 */
export const LATIN_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'curabitur', 'pretium',
  'tincidunt', 'lacus', 'nulla', 'gravida', 'orci', 'a', 'odio', 'nullam',
  'varius', 'turpis', 'molestie', 'volutpat', 'tortor', 'mauris', 'nibh',
  'placerat', 'augue', 'venenatis', 'tellus', 'nec', 'eros', 'rutrum', 'feugiat',
  'felis', 'lectus', 'sapien', 'pulvinar', 'metus', 'fermentum', 'risus',
  'cras', 'donec', 'fringilla', 'congue', 'eu', 'dignissim', 'aliquam',
  'porttitor', 'maecenas', 'lacinia', 'massa', 'tristique', 'condimentum',
  'integer', 'erat', 'tincidunt', 'libero', 'phasellus', 'urna', 'arcu',
  'morbi', 'fermentum', 'nunc', 'leo', 'quam', 'magna', 'malesuada', 'justo',
  'vitae', 'sem', 'lacus', 'auctor', 'praesent', 'commodo', 'sollicitudin',
  'mattis', 'iaculis', 'finibus', 'consectetur', 'maximus', 'vestibulum',
  'fusce', 'dapibus', 'imperdiet', 'tempus', 'suspendisse', 'rhoncus',
  'class', 'aptent', 'taciti', 'sociosqu', 'litora', 'torquent', 'per',
  'conubia', 'nostra', 'inceptos', 'himenaeos', 'porta', 'platea',
  'dictumst', 'hendrerit', 'tellus', 'semper', 'natoque', 'penatibus',
] as const

/** 中文「乱数假文」常用字 —— 偏向无意义但读起来像中文的字符。 */
export const CHINESE_CHARS = [
  '夫', '将', '欲', '以', '观', '于', '天', '地', '万', '物', '之', '本',
  '故', '能', '通', '其', '志', '而', '行', '于', '世', '不', '失', '其',
  '道', '是', '以', '君', '子', '存', '心', '养', '性', '修', '身', '齐',
  '家', '治', '国', '平', '下', '春', '秋', '冬', '夏', '风', '雨', '霜',
  '雪', '云', '雾', '雷', '电', '山', '川', '河', '海', '林', '木', '花',
  '草', '虫', '鱼', '鸟', '兽', '日', '月', '星', '辰', '阴', '阳', '寒',
  '暑', '清', '浊', '动', '静', '生', '灭', '成', '败', '善', '恶', '美',
  '丑', '高', '下', '远', '近', '内', '外', '前', '后', '左', '右', '东',
  '西', '南', '北', '中', '上', '人', '我', '他', '你', '此', '彼', '是',
  '非', '有', '无', '生', '死', '光', '阴', '岁', '月', '年', '时', '日',
  '言', '语', '思', '想', '智', '慧', '心', '情', '喜', '怒', '哀', '乐',
  '悲', '欢', '离', '合', '聚', '散', '逢', '别', '问', '答', '说', '听',
  '看', '见', '观', '察', '知', '识', '学', '习', '读', '书', '写', '作',
  '诗', '词', '歌', '赋', '画', '景', '色', '声', '音', '味', '香', '色',
] as const

/** 中文常用「连接」字，用于在 chars 之间偶尔穿插，提高可读性。 */
export const CHINESE_GLUE = ['、', '，', '。', '；', '：', '？', '！']
