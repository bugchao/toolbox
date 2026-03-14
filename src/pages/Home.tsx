import React from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Newspaper, MapPin, Cloud, ArrowRight } from 'lucide-react'
import { Tool } from '../types'

const Home: React.FC = () => {
  const tools: Tool[] = [
    {
      id: 'qrcode-generate',
      name: '二维码生成',
      description: '快速生成自定义二维码，支持Logo、颜色、大小自定义',
      icon: '📱',
      path: '/qrcode/generate',
      category: '实用工具'
    },
    {
      id: 'qrcode-read',
      name: '二维码解析',
      description: '上传二维码图片或使用摄像头扫描，快速解析内容',
      icon: '🔍',
      path: '/qrcode/read',
      category: '实用工具'
    },
    {
      id: 'qrcode-beautifier',
      name: '二维码美化',
      description: '自定义二维码颜色、样式，添加Logo，生成个性化二维码',
      icon: '✨',
      path: '/qrcode/beautifier',
      category: '实用工具'
    },
    {
      id: 'news',
      name: '每日热点',
      description: '聚合科技、体育、AI、国际等各类热点新闻，每日自动更新',
      icon: '📰',
      path: '/news',
      category: '资讯工具'
    },
    {
      id: 'zipcode',
      name: '邮政编码查询',
      description: '输入地址查询邮编，或输入邮编查询对应地址',
      icon: '📮',
      path: '/zipcode',
      category: '查询工具'
    },
    {
      id: 'weather',
      name: '天气查询',
      description: '查询全球城市天气，实时气温、湿度、风速、未来预报',
      icon: '🌤️',
      path: '/weather',
      category: '查询工具'
    },
    {
      id: 'json',
      name: 'JSON格式化',
      description: 'JSON美化、压缩、校验，一键复制下载',
      icon: '📋',
      path: '/json',
      category: '研发工具'
    },
    {
      id: 'base64',
      name: 'Base64编解码',
      description: '支持文本、图片的Base64编码和解码',
      icon: '🔢',
      path: '/base64',
      category: '研发工具'
    },
    {
      id: 'timestamp',
      name: '时间戳转换',
      description: '时间戳和日期时间的互相转换，支持秒/毫秒级',
      icon: '⏰',
      path: '/timestamp',
      category: '研发工具'
    },
    {
      id: 'url',
      name: 'URL编解码',
      description: 'URL参数的编码和解码，处理接口参数、爬虫等场景',
      icon: '🔗',
      path: '/url',
      category: '研发工具'
    },
    {
      id: 'regex',
      name: '正则表达式测试',
      description: '在线测试正则表达式，支持匹配结果高亮、分组显示',
      icon: '🔍',
      path: '/regex',
      category: '研发工具'
    },
    {
      id: 'cron',
      name: 'Cron表达式生成器',
      description: '可视化生成Cron表达式，定时任务必备',
      icon: '📅',
      path: '/cron',
      category: '研发工具'
    },
    {
      id: 'password',
      name: '密码生成器',
      description: '生成高强度随机密码，支持自定义长度、字符类型',
      icon: '🔑',
      path: '/password',
      category: '研发工具'
    },
    {
      id: 'hash',
      name: '哈希计算工具',
      description: '支持MD5、SHA1、SHA256等多种哈希算法',
      icon: '#️⃣',
      path: '/hash',
      category: '研发工具'
    },
    {
      id: 'code',
      name: '代码美化工具',
      description: '支持JSON、XML、HTML、CSS、JS等多种代码的格式化美化',
      icon: '💄',
      path: '/code',
      category: '研发工具'
    },
    {
      id: 'uuid',
      name: 'UUID生成器',
      description: '生成UUID、随机字符串，用于测试数据、唯一ID生成',
      icon: '🆔',
      path: '/uuid',
      category: '研发工具'
    },
    {
      id: 'image-background-remover',
      name: '图片去背景',
      description: '一键去除图片背景，生成透明背景PNG，本地处理保护隐私',
      icon: '✂️',
      path: '/image-background-remover',
      category: '实用工具'
    },
    {
      id: 'unit-converter',
      name: '单位换算器',
      description: '支持长度、重量、温度、面积、体积等12大类单位换算，实时转换',
      icon: '📏',
      path: '/unit-converter',
      category: '实用工具'
    },
    {
      id: 'text-comparator',
      name: '文本对比工具',
      description: '对比两段文本的差异，支持字符/单词/行级对比，高亮显示增删内容',
      icon: '🔄',
      path: '/text-comparator',
      category: '研发工具'
    },
    {
      id: 'ip-query',
      name: 'IP地址查询',
      description: '查询IP地址的地理位置、运营商、时区等信息，支持地图预览',
      icon: '🌐',
      path: '/ip-query',
      category: '查询工具'
    }
  ]

  const categories = Array.from(new Set(tools.map(tool => tool.category)))

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">欢迎使用工具盒子</h1>
        <p className="text-xl opacity-90 mb-8">
          一个集成多种实用工具的在线平台，持续扩展中...
        </p>
      </div>

      {/* 工具分类 */}
      {categories.map(category => (
        <div key={category}>
          <h2 className="text-2xl font-bold text-white mb-6">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools
              .filter(tool => tool.category === category)
              .map(tool => (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="card hover:transform hover:scale-105 transition-all duration-300 group"
                >
                  <div className="flex items-start">
                    <div className="text-4xl mr-4">{tool.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group:text-indigo-600">
                        {tool.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{tool.description}</p>
                      <div className="flex items-center text-indigo-600 font-medium">
                        立即使用
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ))}

      {/* 特性介绍 */}
      <div className="card mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">平台特性</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-bold text-lg mb-2">快速响应</h3>
            <p className="text-gray-600">基于现代前端技术栈构建，响应迅速，体验流畅</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-bold text-lg mb-2">持续更新</h3>
            <p className="text-gray-600">持续新增实用工具，功能不断扩展</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-bold text-lg mb-2">全平台适配</h3>
            <p className="text-gray-600">完美适配桌面端和移动端，随时随地使用</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
