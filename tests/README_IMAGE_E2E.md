# 图片工具 E2E 测试指南

## 测试文件

已为 6 个图片工具创建完整的 E2E 测试用例：

```
tests/
├── image-watermark.spec.ts          # 图片水印工具测试
├── image-cropper.spec.ts            # 图片裁剪工具测试
├── image-rotator.spec.ts            # 图片旋转工具测试
├── image-filter.spec.ts             # 图片滤镜工具测试
├── image-stitcher.spec.ts           # 图片拼接工具测试
└── image-watermark-remover.spec.ts  # 图片去水印工具测试
```

## 运行测试

### 1. 启动开发服务器

```bash
cd toolbox
pnpm dev
```

等待服务器启动完成（通常访问 http://localhost:5173）

### 2. 运行所有图片工具测试

```bash
pnpm test:e2e -- --grep "图片"
```

### 3. 运行单个工具测试

```bash
# 图片水印
pnpm test:e2e tests/image-watermark.spec.ts

# 图片裁剪
pnpm test:e2e tests/image-cropper.spec.ts

# 图片旋转
pnpm test:e2e tests/image-rotator.spec.ts

# 图片滤镜
pnpm test:e2e tests/image-filter.spec.ts

# 图片拼接
pnpm test:e2e tests/image-stitcher.spec.ts

# 图片去水印
pnpm test:e2e tests/image-watermark-remover.spec.ts
```

### 4. 带 UI 运行测试

```bash
pnpm test:e2e:ui
```

### 5. 查看测试报告

```bash
pnpm test:e2e:report
```

## 测试覆盖

### 图片水印工具 (`image-watermark.spec.ts`)
- ✅ 页面加载
- ✅ 文字水印设置（文字、字体大小、颜色、透明度、旋转）
- ✅ Logo 水印设置（上传、大小、透明度、位置）
- ✅ 图片上传
- ✅ 位置选择（5 种位置）

### 图片裁剪工具 (`image-cropper.spec.ts`)
- ✅ 页面加载
- ✅ 裁剪比例选择（7 种预设）
- ✅ 旋转控制（±90°, 180°, 270°）
- ✅ 翻转控制（水平、垂直）
- ✅ 图片上传

### 图片旋转工具 (`image-rotator.spec.ts`)
- ✅ 页面加载
- ✅ 快速旋转按钮（5 个角度）
- ✅ 自定义角度滑块
- ✅ 翻转按钮（水平、垂直）
- ✅ 上传图片并应用旋转

### 图片滤镜工具 (`image-filter.spec.ts`)
- ✅ 页面加载
- ✅ 预设滤镜显示（12 种）
- ✅ 高级调整参数（8 个滑块）
- ✅ 选择预设滤镜
- ✅ 图片上传

### 图片拼接工具 (`image-stitcher.spec.ts`)
- ✅ 页面加载
- ✅ 拼接方向选择（横向、纵向）
- ✅ 间距设置
- ✅ 背景色选择
- ✅ 上传多张图片
- ✅ 开始拼接按钮

### 图片去水印工具 (`image-watermark-remover.spec.ts`)
- ✅ 页面加载
- ✅ 使用说明显示
- ✅ 画笔大小调节
- ✅ 工具按钮（清除标记、去除水印）
- ✅ 图片上传
- ✅ 画布显示

## 测试截图

运行测试后，Playwright 会自动在以下位置保存截图：

```
test-results/          # 失败测试的截图
playwright-report/     # 完整测试报告
```

## 手动截图

如需手动截图各个工具页面，访问以下 URL：

```
http://localhost:5173/image-watermark
http://localhost:5173/image-cropper
http://localhost:5173/image-rotator
http://localhost:5173/image-filter
http://localhost:5173/image-stitcher
http://localhost:5173/image-watermark-remover
```

使用浏览器开发者工具或截图工具保存页面截图。

## 常见问题

### 测试失败：页面无法加载
确保开发服务器已启动并运行在 `http://localhost:5173`

### 测试失败：元素未找到
检查页面是否完全加载，可能需要增加等待时间：
```typescript
await page.waitForLoadState('networkidle')
```

### Playwright 浏览器未安装
```bash
pnpm test:e2e:ui:install
```

## CI/CD 集成

在 CI 环境中运行测试：

```yaml
# GitHub Actions 示例
- name: Install dependencies
  run: pnpm install

- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps chromium

- name: Run E2E tests
  run: pnpm test:e2e
```

## 测试数据

所有测试使用内建的 1x1 像素 PNG 图片作为测试数据，无需外部文件：

```typescript
const testImage = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)
```

这样可以确保测试快速且可重复。
