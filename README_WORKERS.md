# 新增功能说明

## 🚀 已新增功能

### 1. tRPC 类型安全API
- 替换了部分REST API，提供完整的类型安全
- 前后端类型自动同步，避免类型错误
- 已实现的tRPC接口：
  - `zipcode` - 邮编查询
  - `aiChat` - AI聊天接口

### 2. Cloudflare Workers AI代理
- 实现了Worker脚本，支持调用DeepSeek和OpenAI API
- 自动处理CORS，避免跨域问题
- API密钥安全存储在Cloudflare Secrets中，不会暴露在前端

### 3. AI助手页面
- 新增 `/ai` 路由，提供AI聊天界面
- 支持切换DeepSeek和OpenAI模型
- 实时聊天界面，支持Markdown格式回复

## 📦 部署说明

### 前端部署
代码已经集成到主项目中，正常构建部署即可：
```bash
npm run build
```

### Cloudflare Workers部署
1. 安装wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录Cloudflare账号：
```bash
wrangler login
```

3. 设置API密钥环境变量：
```bash
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put OPENAI_API_KEY
```

4. 部署Worker：
```bash
wrangler deploy
```

5. 部署成功后，将返回的Worker URL更新到 `src/server/trpc.ts` 中的fetch地址。

## 🔧 技术栈

- **tRPC**: 类型安全的前后端通信框架
- **Cloudflare Workers**: 无服务器函数，用于代理AI API请求
- **DeepSeek / OpenAI**: 大语言模型API
- **React Query**: 数据缓存和状态管理

## ⚙️ 配置说明

1. 部署Worker后，更新 `src/server/trpc.ts` 中的Worker URL：
```typescript
// 将下面的URL替换为你的Worker实际地址
const response = await fetch('https://your-worker.your-subdomain.workers.dev', {
  // ...
});
```

2. 确保API密钥有足够的调用额度。

## 🎯 使用方法

1. 访问网站的"AI助手"页面
2. 选择要使用的AI模型（DeepSeek或OpenAI）
3. 输入问题，点击发送即可获得AI回复
