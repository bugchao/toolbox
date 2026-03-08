# 多阶段构建
# 阶段1: 构建前端
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源码
COPY . .

# 构建前端
RUN npm run build

# 阶段2: 生产环境
FROM node:20-alpine

WORKDIR /app

# 安装Python和依赖
RUN apk add --no-cache python3 py3-pip py3-beautifulsoup4 py3-requests
RUN ln -sf python3 /usr/bin/python

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY crawler ./crawler
COPY public ./public

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["npm", "start"]
