# 多阶段构建（使用显式镜像地址，避免 registry scope 报错）
# 阶段1: 构建前端
FROM docker.io/library/node:24-alpine AS builder

WORKDIR /app

# 启用 corepack；具体 pnpm 版本由 package.json 的 packageManager 字段锁定，
# 避免 `pnpm@latest` 随时间漂移到未经验证的新版本（曾导致构建脚本审批机制不兼容而构建失败）
RUN corepack enable

# 直接复制完整 monorepo，避免 workspace 新增后 Dockerfile 清单遗漏导致依赖解析失败
COPY . .

RUN pnpm install --frozen-lockfile

# 构建前端（产出在 apps/web/dist）
RUN pnpm run build

# server.js 直接以源码方式加载 apps/api-gateway + services/* + tools/*/server（无打包步骤），
# 生产阶段必须保留完整 workspace 结构和 pnpm 的 node_modules 链接，不能只挑几个目录复制，
# 否则 import 会因目录缺失而失败。构建完成后裁剪掉 devDependencies 以控制体积。
RUN pnpm prune --prod

# 阶段2: 生产环境（新闻爬虫为 TypeScript，无 Python 依赖）
FROM docker.io/library/node:24-alpine

# 证书/TLS 解析类工具（cert-suite-shared、https-inspector）通过 execFile 调用系统 openssl CLI
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app /app

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "server.js"]
