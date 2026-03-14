// 后端API服务器
import express from 'express'
import path from 'path'
import { exec } from 'child_process'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// 解析JSON请求体
app.use(express.json())

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')))

// API路由
app.get('/api/news', (req, res) => {
  // 运行爬虫脚本获取最新新闻
  exec('python3 crawler/news_crawler.py --output /tmp/news.json', (error, stdout, stderr) => {
    if (error) {
      console.error(`爬虫执行错误: ${error}`)
      // 返回缓存的新闻数据
      try {
        const news = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/news.json'), 'utf-8'))
        res.json(news)
      } catch (e) {
        res.json([])
      }
      return
    }
    
    try {
      const news = JSON.parse(fs.readFileSync('/tmp/news.json', 'utf-8'))
      res.json(news)
    } catch (e) {
      res.json([])
    }
  })
})

app.get('/api/zipcode', (req, res) => {
  const q = req.query.q || ''
  // 简单的邮编查询模拟
  if (/^\d{6}$/.test(q)) {
    // 邮编查询
    res.json({
      code: q,
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      address: '北京市海淀区相关地址'
    })
  } else {
    // 地址查询
    res.json({
      code: '100080',
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      address: q
    })
  }
})

// 所有其他请求返回React应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
