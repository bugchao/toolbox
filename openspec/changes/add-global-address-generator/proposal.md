# Change: 新增多国家地址生成器

## Why

仓库现有「测试数据生成器」只提供中国地址字段，缺少按国家/地区切换地址结构、邮编形态和展示顺序的专用工具。开发者在测试注册、结账、物流标签和国际化表单时，需要快速生成可复制、可导出的合成地址，而不应直接使用真实个人或住宅数据。

参考主流地址生成器的共同交互：可搜索国家、批量生成、切换单行/多行/结构化视图、复制及导出，并清楚区分“格式逼真”和“真实可投递”。本工具采用独立实现与项目现有设计系统，不复制参考站点的品牌、文案或视觉资产。

参考：

- [DummyDetails](https://dummydetails.com/)：国家搜索、批量数量、随机国家、JSON/CSV/TXT 导出与合成数据声明
- [AddressGenerator.org](https://addressgenerator.org/)：国家/地区、数量、单行/多行/JSON、可复现 seed
- [Random-Address.com](https://random-address.com/)：多国家入口与国家化邮编/地址格式说明
- [Faker Localization](https://v9.fakerjs.dev/guide/localization)：本地化实例、回退机制与可用 locale

## What Changes

新增纯前端工具 `tools/tool-address-generator/`，路由 `/address-generator`，分类 `dev`：

- 支持搜索并选择至少 50 个国家/地区格式；中文界面默认中国，英文界面默认美国。
- 支持一次生成 1–50 条地址，或让每条记录随机选择受支持国家。
- 地址记录包含街道/门牌、可选次级地址、城市、州/省/地区、邮编、国家/地区代码，以及按当地顺序排版的完整地址。
- 提供多行卡片、单行、JSON 三种即时视图；支持复制单条、复制全部，并导出 JSON、CSV、TXT。
- 支持可选 seed；相同 seed、国家与数量生成相同结果，便于回归测试。
- 全部在浏览器本地生成，不请求地址 API、不上传或持久化生成内容。
- 明示数据为格式化合成样本，不保证城市、街道、行政区和邮编在现实中相互对应，也不得用于冒充身份、投递或欺诈。
- 中英文界面、键盘可操作、移动端适配，并采用“世界邮政图鉴”视觉方向：纸张/墨色基调、邮戳与标签细节、清晰的数据密度，兼容暗色模式。

## Capabilities

### New Capabilities

- `global-address-generator`：多国家/地区合成地址生成、国家化格式、批量与 seed、复制及导出

### Modified Capabilities

（无）

## Impact

- 新增 `tools/tool-address-generator/`（manifest 自动发现，无需修改旧式 `apps/web/src/config/a-*.ts`）
- 新工具包复用仓库已有版本的 `@faker-js/faker`，并在该包的 `package.json` 声明直接依赖
- `package.json` 依赖变化必须同步提交 `pnpm-lock.yaml` importer 更新
- 新增生成逻辑单测、组件测试与 `tests/address-generator.spec.ts` 浏览器验收
- 不修改现有 `tool-fake-data-gen`，不涉及 API Gateway、数据库或第三方网络服务
- 实现完成后更新 `docs/TOOLS_ROADMAP.md` 与工具清单（如一致性脚本要求）
