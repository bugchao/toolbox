# 多阶段构建（使用显式镜像地址，避免 registry scope 报错）
# 阶段1: 构建前端
FROM docker.io/library/node:24-alpine AS builder

WORKDIR /app

# 使用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/
COPY packages/ui-kit/package.json ./packages/ui-kit/
COPY tools/tool-resume/package.json ./tools/tool-resume/
COPY tools/tool-pdf/package.json ./tools/tool-pdf/
COPY tools/tool-qrcode/package.json ./tools/tool-qrcode/

RUN pnpm install --frozen-lockfile

COPY apps ./apps
COPY packages ./packages
COPY tools ./tools

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
