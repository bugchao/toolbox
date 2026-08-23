# 多国家地址生成器实现计划

**Goal:** 新增纯前端、多国家/地区格式、可复现且可批量导出的合成地址生成器。

**Architecture:** 静态国家 profile 注册表 + Faker v9 本地化实例 + 可注入 seed 的纯生成函数 + 统一结构化记录 + React 展示/导出层。

**Tech Stack:** React 18、TypeScript、`@faker-js/faker@9.9.0`、`@toolbox/ui-kit`、react-i18next、Vitest、Playwright。

## 1. 工具基础设施

- [x] 1.1 用脚手架创建 `tools/tool-address-generator/`，配置 `/address-generator`、`toolAddressGenerator`、`dev` 分类、关键词与中英文 metadata
- [x] 1.2 在新工具包声明 `@faker-js/faker` 直接依赖并同步 `pnpm-lock.yaml`
- [x] 1.3 定义 `CountryProfile`、`GeneratedAddress`、输出视图和生成配置类型

## 2. 国家资料与生成核心（TDD）

- [x] 2.1 建立至少 50 个经过筛选的国家/地区 profile：ISO 代码、中英文名、Faker locale、模板族、可用字段和排序
- [x] 2.2 先写测试再实现 seed 规范化与确定性 RNG，覆盖相同输入复现、不同 seed 分离、随机国家复现
- [x] 2.3 先写测试再实现地址字段生成与国家化格式化，覆盖中/美/英/日/德/法/巴西/印度等代表性模板和缺失可选字段
- [x] 2.4 先写测试再实现 JSON、CSV、TXT 和单行文本序列化，覆盖引号、逗号、换行与 Unicode

## 3. 页面与交互

- [x] 3.1 实现可搜索国家选择器、随机国家开关、1–50 数量控制、可选 seed 和生成操作
- [x] 3.2 实现卡片/单行/JSON 视图、空状态、重新生成反馈、单条复制、复制全部和 JSON/CSV/TXT 下载
- [x] 3.3 实现“世界邮政图鉴”响应式视觉、暗色模式、焦点状态、键盘操作、`aria-live` 结果反馈及 reduced-motion
- [x] 3.4 增加紧邻结果区的合成数据/不可投递免责声明与用途说明
- [x] 3.5 完成 `src/locales/zh.json` 和 `en.json`，不得在组件中硬编码用户可见文案

## 4. 验证与收尾

- [x] 4.1 添加组件测试：国家搜索、默认国家、数量边界、seed、视图切换、复制和下载
- [x] 4.2 添加 `tests/address-generator.spec.ts`：桌面与移动端核心流程、刷新后 seed 复现、无明显横向溢出
- [x] 4.3 运行 `pnpm check:consistency`、相关单测、`pnpm lint`、`pnpm -C apps/web build` 与 Playwright 测试
- [x] 4.4 用浏览器检查中文/英文、亮色/暗色、键盘路径和代表性国家地址顺序
- [x] 4.5 运行 GitNexus `detect_changes --scope compare --base-ref main`，确认仅影响新工具注册与预期页面流程
- [x] 4.6 按实际一致性要求更新 `docs/TOOLS_ROADMAP.md` / `TOOLS_LIST.md`，并把全部已完成任务勾选
