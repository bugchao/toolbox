# 多阶段构建（使用显式镜像地址，避免 registry scope 报错）
# 阶段1: 构建前端
FROM docker.io/library/node:24-alpine AS builder

WORKDIR /app

# 使用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 直接复制完整 monorepo，避免 workspace 新增后 Dockerfile 清单遗漏导致依赖解析失败
COPY . .

RUN pnpm install --frozen-lockfile

# 构建前端（产出在 apps/web/dist）
RUN pnpm run build

# 阶段2: 生产环境（新闻爬虫为 TypeScript，无 Python 依赖）
FROM docker.io/library/node:24-alpine

WORKDIR /app

# 复制生产所需文件并安装依赖（含 cheerio、tsx 用于爬虫）
COPY package.json server.js ./
RUN npm install --omit=dev

COPY crawler ./crawler
COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/public ./public

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "server.js"]
