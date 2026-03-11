# Cloudflare 配置指南

## 🌐 域名配置步骤

### 1. DNS 解析配置
在Cloudflare控制台添加DNS记录：
| 类型 | 名称 | 内容 | 代理状态 | TTL |
|------|------|------|----------|-----|
| A    | your-domain.com | 100.55.92.22 | 代理开启 (橙色云) | Auto |
| A    | www | 100.55.92.22 | 代理开启 (橙色云) | Auto |

### 2. SSL/TLS 配置
1. 进入 SSL/TLS → 概述
2. 选择 **灵活** 模式（EC2上暂时没有配置SSL证书）
3. 开启 "始终使用HTTPS" 规则
4. 开启 "自动HTTPS重写"

### 3. 页面规则配置
添加页面规则优化性能：
```
1. 规则1: *your-domain.com/*
   - 设置：缓存级别 → 缓存所有静态内容
   - 设置：浏览器缓存 TTL → 1小时
   - 设置：Edge缓存 TTL → 7天

2. 规则2: *your-domain.com/api/*
   - 设置：缓存级别 → 不缓存
   - 设置：性能 → 禁用火箭加载器
```

### 4. 安全配置
1. 防火墙规则：允许所有HTTP/HTTPS访问
2. 速率限制：可选配置，防止恶意请求
3. WAF：开启Cloudflare免费WAF规则

## 🔧 Nginx 配置（可选，EC2上配置）
如果需要在EC2上配置HTTPS，可以安装Nginx并使用Cloudflare Origin证书：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📝 验证配置
1. 等待DNS生效（通常几分钟）
2. 访问 `https://your-domain.com` 确认网站正常加载
3. 检查证书是否为Cloudflare颁发的有效证书
4. 测试所有API接口是否正常工作

## 🚀 性能优化建议
- 开启Cloudflare Rocket Loader加速JavaScript加载
- 启用Auto Minify压缩HTML/CSS/JS
- 配置Cloudflare Images优化图片加载
- 使用Cloudflare Workers实现更多边缘计算功能

## 🛡️ 安全建议
- 配置EC2安全组，只允许Cloudflare IP段访问80/443端口
- 定期更新Cloudflare防火墙规则
- 开启Cloudflare DDoS防护
