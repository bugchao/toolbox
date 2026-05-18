// 谁是卧底词对库
// 每对由相似但不同的两个词组成（civilian / undercover），用于卧底机制
// 不带 zh/en 单一字段：词对本身就是不同语言展示，title 用界面语言

export interface WordPair {
  id: string
  category: 'food' | 'drink' | 'sport' | 'place' | 'animal' | 'object' | 'role' | 'media' | 'misc'
  civilian: { zh: string; en: string }
  undercover: { zh: string; en: string }
}

const make = (
  id: string,
  category: WordPair['category'],
  civilianZh: string,
  civilianEn: string,
  undercoverZh: string,
  undercoverEn: string,
): WordPair => ({
  id: `b-${id}`,
  category,
  civilian: { zh: civilianZh, en: civilianEn },
  undercover: { zh: undercoverZh, en: undercoverEn },
})

export const BUILT_IN_WORD_PAIRS: WordPair[] = [
  // 食物 / 饮品
  make('f01', 'food', '苹果', 'Apple', '梨', 'Pear'),
  make('f02', 'food', '香蕉', 'Banana', '芒果', 'Mango'),
  make('f03', 'food', '面条', 'Noodles', '米线', 'Rice Noodles'),
  make('f04', 'food', '饺子', 'Dumpling', '馄饨', 'Wonton'),
  make('f05', 'food', '披萨', 'Pizza', '汉堡', 'Burger'),
  make('f06', 'food', '寿司', 'Sushi', '生鱼片', 'Sashimi'),
  make('f07', 'food', '蛋糕', 'Cake', '面包', 'Bread'),
  make('d01', 'drink', '咖啡', 'Coffee', '奶茶', 'Milk Tea'),
  make('d02', 'drink', '可乐', 'Coke', '雪碧', 'Sprite'),
  make('d03', 'drink', '啤酒', 'Beer', '红酒', 'Wine'),
  // 运动
  make('s01', 'sport', '足球', 'Soccer', '篮球', 'Basketball'),
  make('s02', 'sport', '羽毛球', 'Badminton', '乒乓球', 'Table Tennis'),
  make('s03', 'sport', '游泳', 'Swimming', '潜水', 'Diving'),
  make('s04', 'sport', '跑步', 'Running', '骑行', 'Cycling'),
  // 地点
  make('p01', 'place', '电影院', 'Cinema', '剧院', 'Theater'),
  make('p02', 'place', '北京', 'Beijing', '上海', 'Shanghai'),
  make('p03', 'place', '咖啡馆', 'Café', '茶馆', 'Tea House'),
  make('p04', 'place', '医院', 'Hospital', '诊所', 'Clinic'),
  // 动物
  make('a01', 'animal', '猫', 'Cat', '老虎', 'Tiger'),
  make('a02', 'animal', '狗', 'Dog', '狼', 'Wolf'),
  make('a03', 'animal', '熊猫', 'Panda', '北极熊', 'Polar Bear'),
  make('a04', 'animal', '鸽子', 'Pigeon', '麻雀', 'Sparrow'),
  // 物品
  make('o01', 'object', '钢笔', 'Fountain Pen', '铅笔', 'Pencil'),
  make('o02', 'object', '手机', 'Phone', '平板', 'Tablet'),
  make('o03', 'object', '雨伞', 'Umbrella', '雨衣', 'Raincoat'),
  make('o04', 'object', '吉他', 'Guitar', '尤克里里', 'Ukulele'),
  // 角色 / 职业
  make('r01', 'role', '老师', 'Teacher', '教授', 'Professor'),
  make('r02', 'role', '医生', 'Doctor', '护士', 'Nurse'),
  make('r03', 'role', '警察', 'Police', '保安', 'Security Guard'),
  // 媒体 / 影视
  make('m01', 'media', '哈利波特', 'Harry Potter', '指环王', 'Lord of the Rings'),
  make('m02', 'media', '小说', 'Novel', '漫画', 'Comic'),
  // 其他
  make('x01', 'misc', '微信', 'WeChat', 'QQ', 'QQ'),
  make('x02', 'misc', '抖音', 'Douyin', '快手', 'Kuaishou'),
  make('x03', 'misc', '春节', 'Chinese New Year', '元宵节', 'Lantern Festival'),
  make('x04', 'misc', '高铁', 'High-speed Rail', '动车', 'Bullet Train'),
]
