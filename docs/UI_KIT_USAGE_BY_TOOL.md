# ui-kit 使用约定

这份文档不再维护“每个工具对应哪些组件”的大表，而是保留当前有效的复用规则。

## 核心原则

1. 工具优先复用 `packages/ui-kit`
2. 多个工具会复用的交互，先抽到 `ui-kit`
3. 外部 UI 组件库必须先封装，再给工具使用
4. 主题、尺寸、状态、空态、错误态要在 `ui-kit` 层统一

## 适合抽到 ui-kit 的能力

- 基础表单：`Button`、`Input`、`TextArea`、`Select`、上传区
- 布局容器：`Card`、`PageHero`、`NoticeCard`、工作台容器
- 数据展示：指标卡、属性网格、表格、历史记录面板
- 通用视觉：背景层、主题 token、图表容器、过渡动画

## 什么时候不要直接在工具里写

- 同一种卡片或面板在两个及以上工具里重复出现
- 需要引入第三方日期、图表、表格、上传、编辑器能力
- 工具内自己拼出一套和站点风格冲突的按钮、输入框、空态或通知样式

## 新增外部库的约束

- 先评估是否已有现成能力
- 如果确实需要新增，先封装到 `packages/ui-kit`
- 工具侧只引用 `@toolbox/ui-kit` 暴露的组件，不直接依赖那套外部库

## 与文档体系的关系

- 新工具如何落地：看 [TOOL_LANDING.md](./TOOL_LANDING.md)
- 日常开发流程：看 [refactor-structure.md](./refactor-structure.md)
- 工具是否已经存在：看 [TOOLS_ROADMAP.md](./TOOLS_ROADMAP.md)
