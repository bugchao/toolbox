## Context

地址格式随国家/地区变化：字段是否存在、行政区名称、邮编形态与排版顺序并不统一。项目当前已有 `@faker-js/faker@9.9.0`（由 `tool-mock-api` 使用），其 v9 本地化实例覆盖 60 余种语言/地区变体，但部分 locale 数据不完整并会回退到英文。Faker v9 也没有较新版本中的统一 `postalAddress()` API，因此不能把多个独立字段直接拼成同一种西式地址模板。

主流工具强调快速选择、批量输出和导出；本工具的目标是开发/设计测试数据，而不是地址验证、真实地址发现或身份生成。

## Goals / Non-Goals

- Goals:
  - 至少 50 个明确标注的国家/地区格式，提供本地文字和国家化邮编形态。
  - 生成结构化字段与当地顺序的完整地址，支持稳定 seed、批量复制和导出。
  - 纯前端、零网络请求、清晰披露合成数据限制。
  - 视觉上像一套精心编排的“世界邮政图鉴”，同时保持高效操作和无障碍可用性。
- Non-Goals:
  - 不验证地址真实存在、可投递或邮编与城市严格匹配。
  - 不生成姓名、电话、邮箱、身份证件、经纬度等身份或位置扩展数据。
  - 不尝试宣称覆盖全部主权国家；界面明确显示当前支持数量。
  - 不保存预设、历史记录或生成结果。

## Decisions

### Decision: 独立工具而非扩展通用测试数据生成器

新增 `tool-address-generator`。专用页面能容纳国家搜索、国家说明、地址格式预览、卡片操作和安全声明；通用测试数据生成器继续承担自定义 schema 和多字段导出的职责。

Alternative considered: 给 `tool-fake-data-gen` 增加国家参数。该页面的字段类型模型以单字段生成器为核心，不适合表达一条内部有关联、又有国家化排版的地址记录。

### Decision: 显式国家注册表 + Faker 本地化实例 + 自有格式化层

建立静态 `CountryProfile` 注册表，记录 ISO 代码、中文/英文名称、Faker locale、地址行模板、字段标签和字段可用性。生成层通过显式动态 import 按需加载对应的 Faker v9 locale 实例，自有格式化层按 profile 组装完整地址；因此进入工具时不会一次下载全部国家数据。

仅把经过单测、具备必要 location 数据的 profile 暴露到选择器；不把语言 locale 数量直接等同于国家覆盖数量。对于 Faker locale 的缺失字段，可使用 profile 指定的可控回退或留空，并在代码注释中说明。

Alternative considered: 自建所有国家的街道/城市数据池。维护成本和错误率过高，也会在仓库内引入大量静态地名数据。

Alternative considered: 调用在线地址 API。会引入网络可用性、隐私、限流和成本问题，与本地工具定位不符。

### Decision: 可复现但不承诺现实地理一致性

将用户 seed 规范化为确定性整数序列，再调用所选 Faker 实例的 `seed()`。相同 seed、国家列表、随机国家开关和数量必须生成相同的结构化记录。

生成结果只保证字段形态和排版近似当地习惯，不保证街道、城市、行政区与邮编的现实对应关系。页面始终展示短免责声明，详细说明放在结果区附近而不是藏在帮助页。

### Decision: 输出模型固定、视图与导出共享同一数据源

内部记录使用统一结构：

```ts
interface GeneratedAddress {
  id: string
  countryCode: string
  countryName: string
  addressLine1: string
  addressLine2?: string
  city: string
  region?: string
  postalCode?: string
  formatted: string
}
```

卡片、单行、JSON、复制和下载均从同一组 `GeneratedAddress[]` 派生，避免各格式之间内容漂移。CSV 导出使用稳定列顺序和 RFC 4180 风格转义；TXT 使用国家 profile 的多行 `formatted` 文本。

### Decision: “世界邮政图鉴”视觉系统

采用暖纸色/深墨色为主色、朱红邮戳为单一强调色；背景使用纯 CSS 经纬网和细噪点，结果卡像邮寄标签但不牺牲字段可读性。标题字体使用项目可安全加载的高辨识度衬线回退组合，正文采用清晰的人文无衬线组合。动效集中在首次结果展开和重新生成的短暂“盖章”反馈，并尊重 `prefers-reduced-motion`。

不新增图片素材，不依赖外部字体网络请求；暗色模式转为深蓝黑“夜航邮件”主题。

## Risks / Trade-offs

- Faker locale 覆盖不均 → 用注册表白名单、逐 profile 契约测试和清楚的格式化合成声明控制质量。
- 导入大量 locale 增加 bundle → 只导入注册表使用的实例；构建时检查新 chunk 大小，必要时把 locale map 动态分组加载。
- 随机国家模式难以复现 → 国家选择也必须使用同一个 seed 派生的 RNG，不使用 `Math.random()`。
- 特殊地址顺序难以完全覆盖 → 先按经过测试的模板族实现，国家 profile 可单独覆盖，不用条件分支散落在组件中。
- 合成地址偶然撞上真实地址 → 明示不得用于真实投递/身份用途；不提供真实性验证或地图链接。

## Migration Plan

1. 新建工具包和 manifest，声明 Faker 直接依赖并同步 lockfile。
2. 完成 profile 注册表、seed、生成与格式化纯函数及单测。
3. 完成页面、i18n、复制/下载与无障碍交互。
4. 运行一致性、单测、lint、构建和 Playwright 验收。
5. 若出现回归，可整包移除新工具；无旧数据或 API 需要迁移。

## Open Questions

（无；提案默认采用“至少 50 个经过验证的国家/地区格式”，不作不准确的全世界无遗漏承诺。）
