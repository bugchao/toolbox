# 🛠️ 工具盒子 - 多功能在线工具集

一个功能丰富的在线工具网站，基于 **Monorepo** 构建，主应用与工具包分离，目前已上线 **31 个实用工具**，目标支撑 **1000+ 工具** 的插件化平台。

## 🚀 快速开始（后续开发直接按此操作）

### 环境要求
- **Node.js 24+**
- **pnpm 8+**（推荐 `corepack enable && corepack prepare pnpm@latest --activate`）

### 一键跑起来
```bash
# 克隆后
pnpm install
pnpm dev
```
浏览器打开 **http://localhost:3000** 即可。

### 常用命令
| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（端口 3000） |
| `pnpm build` | 生产构建（产出在 `apps/web/dist`） |
| `pnpm preview` | 预览构建结果 |
| `pnpm start` | 生产模式运行（需先 `pnpm build`） |
| `pnpm crawl:news` | 爬取新闻到 `apps/web/public/news.json` |
| `pnpm test:e2e` | 运行 E2E 测试（Playwright） |

> 详细目录结构、添加新工具步骤、工具包扩展方式见 **[docs/refactor-structure.md](docs/refactor-structure.md)**（开发必读）。

---

## ✨ 功能列表（31 个已上线）

### 📱 实用工具（16 个）
- 二维码生成 / 解析 / 美化、图片压缩、图片去背景、Markdown 转换、BMI 计算器、单位换算、**PDF 工具集**、短链接生成、**简历生成器**、**AI 配色生成器**、表情包生成、AI 文案生成、电子木鱼、人生进度条 等

### 👨‍💻 研发工具（11 个）
- JSON 格式化、Base64/URL 编解码、时间戳、正则/Cron、密码/哈希、代码美化、UUID、文本对比 等

### 🔍 查询 / 资讯（5 个）
- 邮编、天气、IP 查询、颜色拾取、每日热点

完整清单见 **[TOOLS_LIST.md](TOOLS_LIST.md)**。

---

## 🏗️ 技术栈与架构

- **前端**：React 18 + TypeScript + Vite，Tailwind CSS，Lucide 图标
- **包管理**：pnpm workspace（`apps/*`、`packages/*`、`tools/*`）
- **主应用**：`apps/web`（壳 + 路由 + 按需懒加载工具包）
- **工具包**：`tools/tool-resume`、`tools/tool-pdf`、`tools/tool-qrcode` 等，各自独立依赖、可独立开发
- **公共包**：`packages/core`（类型 + ToolLoader）、`packages/ui-kit`（通用 UI）
- **后端**：Express 静态 + API，新闻爬虫为 TypeScript（cheerio），Docker 部署无 Python 依赖

架构演进与规划见 **[ARCHITECTURE.md](ARCHITECTURE.md)**。

---

## 📂 项目结构（重构后）

```
toolbox/
├── apps/web/              # 主应用（开发/构建入口）
│   ├── src/
│   │   ├── App.tsx        # 路由 + React.lazy 加载工具包
│   │   ├── pages/         # 主应用内页面（未拆到 tools 的）
│   │   └── components/
│   ├── public/
│   └── package.json
├── packages/
│   ├── core/              # 工具类型、ToolLoader
│   └── ui-kit/            # 通用 UI 组件
├── tools/                 # 独立工具包（各自 package.json）
│   ├── tool-resume/       # 简历生成器
│   ├── tool-pdf/          # PDF 工具集
│   └── tool-qrcode/       # 二维码三合一
├── package.json           # 根脚本 + express + playwright
├── server.js              # 生产静态与 API
├── crawler/               # 新闻爬虫
└── docs/
    └── refactor-structure.md   # 开发与扩展说明（必读）
```

---

## 🔧 扩展新功能

### 方式一：在主应用内新增页面（简单工具、无重依赖）
1. 在 `apps/web/src/pages/` 新建页面组件
2. 在 `apps/web/src/App.tsx` 增加路由
3. 在 `apps/web/src/components/Layout.tsx` 和 `apps/web/src/pages/Home.tsx` 增加导航与首页卡片
4. 更新 `TOOLS_LIST.md`

### 方式二：新增独立工具包（有专属依赖、需独立开发）
1. 在 `tools/` 下新建 `tool-xxx/`，配置 `package.json`（name: `@toolbox/tool-xxx`，main: `src/index.tsx`）
2. 在 `apps/web/package.json` 增加 `"@toolbox/tool-xxx": "workspace:*"`
3. 在 `apps/web/src/App.tsx` 用 `React.lazy(() => import('@toolbox/tool-xxx'))` 挂路由
4. 在 `apps/web/vite.config.ts` 的 `optimizeDeps.exclude` 加上 `@toolbox/tool-xxx`
5. `pnpm install` 后即可开发

详细步骤与注意事项见 **[docs/refactor-structure.md](docs/refactor-structure.md)**。

---

## 🐳 Docker 部署

**一键构建并运行**（推荐）：

```bash
pnpm run docker:deploy
```

会依次执行：构建镜像 → 停止并删除旧容器（若存在）→ 启动新容器，访问 http://localhost:3000。

**分步命令**：

| 命令 | 说明 |
|------|------|
| `pnpm run docker:build` | 构建镜像 `toolbox:latest` |
| `pnpm run docker:run` | 启动容器（端口 3000，名称 `toolbox`，重启策略 unless-stopped） |
| `pnpm run docker:stop` | 停止并保留容器 |

如需映射到 80 端口：`docker run -d -p 80:3000 --name toolbox --restart unless-stopped toolbox:latest`

**若构建报错 `pull access denied` / `insufficient_scope`**：多为未登录 Docker Hub 或网络限制。可先执行 `docker login` 后重试；或在 Docker 设置中配置可用镜像加速/镜像源后再构建。

## ☁️ AWS 本地部署

AWS 部署不再通过 GitHub Actions 执行，改为在本地机器直接运行脚本。这样密钥、SSH 私钥和 AWS 登录态都只留在你的本机环境。

### 前置要求
- 本机已安装并登录 `aws` CLI
- 本机可执行 `docker`
- 本机可通过 SSH 连接到目标 EC2
- 目标 EC2 已安装 `docker` 与 `aws` CLI，并具备拉取 ECR 镜像权限

### 必填环境变量

```bash
export AWS_REGION=ap-southeast-1
export ECR_REPOSITORY=your-ecr-repository
export EC2_HOST=1.2.3.4
export EC2_USER=ec2-user
export EC2_KEY_PATH=$HOME/.ssh/your-key.pem
```

### 可选环境变量

```bash
export APP_NAME=toolbox
export HOST_PORT=80
export CONTAINER_PORT=3000
export IMAGE_TAG=toolbox-manual-001
export AWS_ACCOUNT_ID=123456789712
export ECR_REGISTRY=123456789712.dkr.ecr.ap-southeast-1.amazonaws.com
```

### 执行部署

```bash
pnpm run aws:deploy
```

脚本位置：`scripts/deploy-aws-ec2.sh`

执行流程：
- 本地构建 Docker 镜像
- 登录 ECR 并推送镜像
- SSH 登录 EC2，拉取最新镜像并重启容器
- 本地用 `curl` 对目标主机做一次基础可用性检查

---

## 📄 文档索引

| 文档 | 说明 |
|------|------|
| [docs/refactor-structure.md](docs/refactor-structure.md) | **开发与扩展说明**（运行、结构、添加工具/工具包） |
| [docs/TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md) | **工具规划与落位**（已开发代码位置、待开发/调研清单、分类定义） |
| [docs/ROADMAP_CONVENTION.md](docs/ROADMAP_CONVENTION.md) | **规划约定**（怎么提规划、放哪里、怎么给 AI、避免重复） |
| [TOOLS_LIST.md](TOOLS_LIST.md) | 完整工具清单与统计（与 TOOLS_ROADMAP 同步） |
| [ROADMAP.md](ROADMAP.md) | **高层路线图**（当前状态、下一阶段、目标概览；细节看 TOOLS_ROADMAP + ARCHITECTURE） |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 架构演进与分阶段实施 |
| [docs/monorepo-tools-split-analysis.md](docs/monorepo-tools-split-analysis.md) | Monorepo 工具拆分分析 |

---

## 📄 许可证

MIT License
