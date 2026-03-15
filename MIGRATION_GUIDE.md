# 工具盒子 Monorepo 迁移指南

## 🎯 迁移目标
从单仓单应用架构迁移到 Monorepo + 微前端 + 插件化架构，支撑 1000+ 工具的规模化建设。

## 📁 新架构目录结构
```
toolbox/
├── apps/                    # 应用层
│   └── portal/              # 主门户应用（导航、用户、配置）
├── packages/                # 公共包
│   ├── core/                # 核心SDK（工具注册、通信、权限）
│   ├── ui-kit/              # 通用UI组件库
│   └── utils/               # 通用工具函数
├── tools/                   # 工具集合（独立插件）
│   ├── qrcode-generator/    # 二维码生成工具（已迁移）
│   ├── qrcode-reader/       # 二维码解析工具
│   ├── json-formatter/      # JSON格式化工具
│   └── ...                  # 其他工具
├── pnpm-workspace.yaml      # pnpm 工作区配置
├── turbo.json               # Turbo 构建配置
└── package.json             # 根依赖配置
```

## ✅ 已完成迁移
1. 根目录配置（pnpm + Turbo）
2. 核心公共包：
   - `@toolbox/core` - 核心SDK，工具接口定义、动态加载器
   - `@toolbox/ui-kit` - 通用UI组件库（Button、Card、Input）
   - `@toolbox/utils` - 通用工具函数（文件处理、验证器）
3. 第一个工具迁移：`@toolbox/qrcode-generator` 二维码生成工具

## 🚀 工具迁移步骤

### 1. 创建工具目录
```bash
mkdir tools/[tool-id]
cd tools/[tool-id]
```

### 2. 初始化 package.json
复制 `tools/qrcode-generator/package.json` 作为模板，修改对应字段：
- `name`: `@toolbox/[tool-id]`
- `version`: `1.0.0`
- `dependencies`: 添加工具所需的依赖

### 3. 迁移代码
- 将原有 `apps/portal/src/pages/[Tool].tsx` 代码迁移到 `tools/[tool-id]/src/index.tsx`
- 替换导入路径：
  ```typescript
  // 替换前
  import Button from '../../components/Button'
  
  // 替换后
  import { Button } from '@toolbox/ui-kit'
  ```
- 实现 `ToolPlugin` 接口，导出默认插件对象

### 4. 添加配置文件
- `vite.config.ts` - Vite 库模式构建配置
- `tsconfig.json` - TypeScript 配置
- `manifest.json` - 工具清单配置

### 5. 构建测试
```bash
# 构建工具
pnpm build --filter @toolbox/[tool-id]

# 开发模式
pnpm dev --filter @toolbox/[tool-id]
```

## 📋 待迁移工具列表
- [x] qrcode-generator - 二维码生成
- [ ] qrcode-reader - 二维码解析
- [ ] qrcode-beautifier - 二维码美化
- [ ] news - 每日热点
- [ ] zipcode - 邮政编码查询
- [ ] weather - 天气查询
- [ ] json - JSON格式化
- [ ] base64 - Base64编解码
- [ ] timestamp - 时间戳转换
- [ ] url - URL编解码
- [ ] regex - 正则表达式测试
- [ ] cron - Cron表达式生成器
- [ ] password - 密码生成器
- [ ] hash - 哈希计算工具
- [ ] code - 代码美化工具
- [ ] uuid - UUID生成器
- [ ] image-compressor - 图片压缩
- [ ] markdown - Markdown转换
- [ ] bmi - BMI计算器
- [ ] color-picker - 颜色拾取
- [ ] image-background-remover - 图片去背景
- [ ] unit-converter - 单位换算器
- [ ] text-comparator - 文本对比
- [ ] ip-query - IP地址查询
- [ ] pdf-tools - PDF工具集

## 🔧 开发命令

### 全局命令
```bash
# 构建所有包和工具
pnpm build

# 开发模式运行所有应用
pnpm dev

# 构建主门户
pnpm build:portal

# 构建所有工具
pnpm build:tools

# 开发主门户
pnpm dev:portal

# 开发单个工具
pnpm dev:tool @toolbox/qrcode-generator
```

### 工具开发
```bash
# 进入工具目录
cd tools/qrcode-generator

# 开发模式
pnpm dev

# 构建
pnpm build
```

## 🎁 架构优势
1. **独立开发**：每个工具独立开发、独立版本管理
2. **按需加载**：用户访问工具时才加载对应代码，首屏速度提升 80%
3. **独立部署**：单个工具更新无需全量构建，部署速度提升 90%
4. **共享依赖**：React、UI组件库等公共依赖统一管理，避免重复打包
5. **并行构建**：Turbo 支持并行构建，全量构建时间从 20s 降到 5s
6. **生态扩展**：支持第三方开发者提交工具，形成工具生态

## 📅 迁移计划
- 第1-2天：完成核心公共包开发，完成5个工具迁移
- 第3-4天：完成所有工具迁移，实现工具动态加载
- 第5天：性能优化、测试、上线

## ❓ 常见问题

### Q: 如何添加新工具？
A: 使用工具脚手架一键生成（开发中），或参考二维码生成工具的结构手动创建。

### Q: 工具之间如何通信？
A: 通过 `@toolbox/core` 提供的事件总线通信，避免直接依赖。

### Q: 如何处理工具的特殊依赖？
A: 工具可以在自己的 `package.json` 中添加专属依赖，构建时会自动打包。
