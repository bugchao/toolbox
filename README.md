# 🛠️ 工具盒子 - 多功能在线工具集

一个功能丰富的在线工具网站，基于现代化技术栈构建，支持多种实用功能。

## ✨ 功能列表

### 📱 二维码工具
- **二维码生成**：支持自定义内容、大小、颜色，可下载PNG或复制到剪贴板
- **二维码解析**：支持上传图片解析或摄像头实时扫描

### 📰 资讯工具
- **每日热点**：实时爬取科技、体育、AI、OpenClaw、MCP、国际等各类新闻，支持分类筛选

### 🔍 查询工具
- **邮政编码查询**：支持地址查邮编和邮编查地址，覆盖全国
- **天气查询**：基于免费Open-Meteo API，支持国内主要城市实时天气和7天预报

## 🚀 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **后端**：Express.js
- **爬虫**：Python + BeautifulSoup4
- **部署**：Docker + AWS EC2 + GitHub Actions CI/CD

## 📦 本地开发

### 环境要求
- Node.js 20+
- Python 3.8+

### 安装依赖
```bash
npm install
pip install beautifulsoup4 requests
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000

### 生产构建
```bash
npm run build
npm start
```

### 手动爬取新闻
```bash
npm run crawl:news
```

## 🐳 Docker部署

```bash
# 构建镜像
docker build -t toolbox .

# 运行容器
docker run -d -p 80:3000 --name toolbox --restart always toolbox
```

## ☁️ 自动部署

项目配置了GitHub Actions自动部署，提交代码到main分支会自动触发：
1. 构建Docker镜像
2. 推送到AWS ECR
3. 部署到EC2实例
4. 自动验证部署结果

## 📂 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # 公共组件
│   ├── pages/              # 页面组件
│   ├── types/              # TypeScript类型定义
│   ├── App.tsx             # 应用入口
│   └── main.tsx            # 渲染入口
├── crawler/                # 爬虫脚本
│   └── news_crawler.py     # 新闻爬虫
├── public/                 # 静态资源
├── server.js               # 后端API服务
├── Dockerfile              # Docker配置
└── .github/workflows/      # CI/CD配置
```

## 🔧 扩展新功能

项目采用模块化设计，新增工具非常简单：

1. 在`src/pages/`创建新的页面组件
2. 在`src/App.tsx`添加路由配置
3. 在`src/components/Layout.tsx`添加导航菜单
4. 如需要后端接口，在`server.js`添加API路由

## 📄 许可证

MIT License
