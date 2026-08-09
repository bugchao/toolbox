# calendar 实现计划

> 按任务顺序执行，独立子任务可并行；每个含逻辑的模块 TDD（先测后码）。

**Goal:** 纯前端万年历：月视图网格 + 公历/农历真实换算（1900–2100）+ 24 节气标注 + 传统节日标注 + 日期详情面板。

**Architecture:** 静态历法数据（农历数据表、节气常数）+ 纯函数（农历换算、节气计算、节日查找，均可脱离 DOM/网络单测）+ 一个月视图主组件。

**Tech Stack:** React 18 + TS、`@toolbox/ui-kit`（PageHero，可选复用 `DatePicker.tsx` 的 `getTodayString`）、vitest、零新依赖。

## Global Constraints

- 目录 `tools/tool-calendar/`，路由 `/calendar`，namespace `toolCalendar`，组件 `CalendarView`
- `categoryKey: 'utility'`，icon 用 lucide `Calendar`
- 不改后端；不改 `apps/web/src/config/a-*.ts`；不加新依赖
- i18n zh/en 同步（英文界面下农历/节气名称仍用中文原名，属专有历法术语不强行意译）
- 农历数据表范围 1900–2100，超出范围时农历/节气/节日均不展示（不报错，静默降级）
- commit 用 `GIT_AUTHOR_EMAIL=dengyongchao1@gmail.com GIT_COMMITTER_EMAIL=dengyongchao1@gmail.com`，不改 git config

---

## 并行组 1（基础设施，串行）

- [x] 1.1 `pnpm create:tool calendar && pnpm install`
- [x] 1.2 改 manifest：`categoryKey:'utility'`、icon `Calendar`、keywords（万年历/农历/黄历/节气/节假日/calendar/lunar）、meta zh「万年历」/en「Perpetual Calendar」
- [x] 1.3 `src/lib/types.ts`：`LunarDate {year,month,day,isLeap,dayName,monthName}`、`DayInfo {solar:Date,lunar:LunarDate,solarTerm?:string,festival?:string,isToday:boolean}`

## 并行组 2（历法核心，可分工但有先后依赖）

- [x] 2.1 `src/lib/lunarData.ts`：1900–2100 年农历数据表（每年一个 16 位编码：闰月月份 4 位 + 12/13 个月的大小月 bitmap），基准日 1900-01-31（农历 1900 年正月初一）
- [x] 2.2 `src/lib/lunar.ts`（+ 单测，依赖 2.1）：`solarToLunar(date: Date): LunarDate`，逐年/逐月累减天数定位农历年月日；`lunarDayName(day, isLeap)`/`lunarMonthName(month, isLeap)` 格式化为"初一"「闰二月」等中文
  - 单测：已知参考日期（如 2024-02-10 → 农历甲辰年正月初一）、闰月年份（如 2023 年闰二月）、数据表边界（1900-01-31、2100 年末）
- [x] 2.3 `src/lib/solarTerm.ts`（+ 单测）：`getSolarTerm(date: Date): string | null`，24 节气近似算法（回归年长度 + 年度偏移常数），精度 ±1 日
  - `// ponytail: 近似天文算法，±1 日误差，需要天文台级精度时换成 VSOP87 太阳视黄经计算`
  - 单测：验证某年 24 个节气按时间顺序出现、间隔约 15 天、与已知参考日期（如 2024 年立春 2/4）相差不超过 1 天
- [x] 2.4 `src/lib/holidays.ts`（+ 单测，依赖 2.2 输出的 LunarDate）：`getFestival(date: Date, lunar: LunarDate): string | null`，固定公历节日表 + 农历传统节日（春节/元宵/清明/端午/七夕/中秋/重阳/除夕，除夕按"次日为次年正月初一"判定）
  - 单测：元旦（公历固定）、春节（农历正月初一）、除夕判定（12 月最后一天，含大月/小月两种情况）

## 并行组 3（UI + i18n，依赖组 2）

- [x] 3.1 `src/CalendarView.tsx`：月视图网格（周表头 + 6 行日期格）、上月/下月/今天导航、每格显示公历数字 + 农历/节气/节日文本、点击展开详情面板
- [x] 3.2 `src/index.tsx` 导出
- [x] 3.3 `src/locales/zh.json` + `en.json`：标题、月份/星期表头、详情面板标签、超出数据范围提示

## 并行组 4（质量关卡 + 收尾）

- [x] 4.1 `pnpm check:consistency` / `pnpm lint` / `pnpm test` / `pnpm -C apps/web build` 全绿
- [x] 4.2 手工验收：`pnpm dev` 打开 `/calendar`，核对当月农历日期与真实黄历一致、切月/跳今天正常、点击详情面板展示正确
- [x] 4.3 `docs/TOOLS_ROADMAP.md`：把「万年历」从「待开发」移到「二、已开发」→ 实用工具，补路由与代码位置
