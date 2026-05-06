# 渐变色生成器工具

## 功能特性

✅ **渐变类型**
- 线性渐变（linear-gradient）
- 径向渐变（radial-gradient）
- 圆锥渐变（conic-gradient）

✅ **颜色控制**
- 支持 2-5 个颜色节点
- 颜色拾取器（HEX/RGB/HSL）
- 颜色位置调整（0-100%）
- 添加/删除颜色节点

✅ **参数调整**
- 渐变角度控制（0-360度）
- 实时预览

✅ **预设方案**
- 10+ 种预设渐变色方案
- 随机生成渐变色

✅ **代码导出**
- CSS 代码（一键复制）
- Tailwind CSS 类名
- SVG 代码

✅ **响应式设计**
- 桌面端完整功能
- 移动端适配

## 技术栈

- React 18.3.1
- TypeScript
- Tailwind CSS
- Lucide React (图标)
- react-i18next (国际化)

## 文件结构

```
tool-gradient-gen/
├── package.json          # 依赖配置
├── manifest.ts           # 工具清单
├── locales/
│   ├── zh-CN.json       # 中文翻译
│   └── en-US.json       # 英文翻译
└── src/
    ├── index.tsx        # 导出入口
    └── GradientGen.tsx  # 主组件
```

## 使用说明

1. 选择渐变类型（线性/径向/圆锥）
2. 调整渐变角度
3. 添加/删除颜色节点
4. 调整每个颜色的色值和位置
5. 实时预览效果
6. 复制生成的代码

## 构建验证

- ✅ TypeScript 类型检查通过
- ✅ pnpm build 通过
- ✅ Git 提交完成

## 分支信息

- 分支名：`feat/tool-gradient-gen`
- 提交信息：feat: add gradient generator tool
