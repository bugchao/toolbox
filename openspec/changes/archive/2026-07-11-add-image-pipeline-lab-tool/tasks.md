# image-pipeline-lab 实现计划

> **For agentic workers:** 按任务顺序执行，每任务 TDD（先测后码）+ 独立提交。步骤用 checkbox 跟踪。

**Goal:** 纯前端图像效果管线实验台：有序叠加 10 种效果、调参、撤销/重做、流程保存/导入导出、PNG 导出。

**Architecture:** 核心逻辑全部为纯函数（`src/lib/`：效果表、管线 reducer + 历史、持久化），UI 只是薄壳。像素级效果操作 `PixelBuffer`（`{data,width,height}`）而非 canvas，保证 jsdom 可测。canvas 编排（`render.ts`）不做单测，由 build + 手工验收覆盖。

**Tech Stack:** React 18 + TS、`ctx.filter`/`getImageData`、`@toolbox/ui-kit`（PageHero/Button/Card）、vitest(jsdom)、零新依赖。

## Global Constraints

- 目录 `tools/tool-image-pipeline-lab/`，路由 `/image-pipeline-lab`，namespace `toolImagePipelineLab`，组件 `ImagePipelineLab`
- `categoryKey: 'utils'`（与 tool-image-canvas-lab 一致），icon 用 lucide `FlaskConical`
- 不改 `apps/web/src/config/a-*.ts`（manifest 自动发现）；不触碰后端；不加新依赖
- i18n zh/en 同步，全部文案走 `t()`

---

## 并行组 1（基础设施，串行）

### Task 1: 脚手架 + manifest + 类型

**Files:** Create `tools/tool-image-pipeline-lab/`（脚手架）、`src/lib/types.ts`
**Produces:** `EffectType`（10 个字面量）、`PipelineStep {id,type,value,enabled}`、`PixelBuffer {data,width,height}`

- [x] `pnpm create:tool image-pipeline-lab && pnpm install`
- [x] 改 manifest：`categoryKey:'utils'`、`icon: FlaskConical`、keywords（管线/滤镜/像素/实验/pipeline/filter）、meta zh「图像处理实验工作台」/en「Image Pipeline Lab」
- [x] 写 `src/lib/types.ts`（上述三个类型）
- [x] Commit `feat(tool-image-pipeline-lab): scaffold + manifest + types`

## 并行组 2（核心纯函数，互相独立，各带测试）

### Task 2: 效果定义表 `src/lib/effects.ts` (+`effects.test.ts`)

**Produces:** `EFFECTS: Record<EffectType, EffectDef>`、`EFFECT_TYPES: EffectType[]`；
`EffectDef = {kind:'filter',min,max,step,defaultValue,toFilter(v)=>string} | {kind:'pixel',…,applyPixel(buf,v):void}`

8 个 filter 效果：brightness/contrast/saturate(0-200,默认100,`%`)、grayscale/sepia/invert(0-100,默认100)、hueRotate(0-360,默认90,`hue-rotate(Ndeg)`)、blur(0-20,step0.5,默认4,`blur(Npx)`)。
2 个 pixel 效果：pixelate(块平均马赛克,2-64,默认8)、threshold(亮度 0.2126R+0.7152G+0.0722B 二值化,0-255,默认128)。

- [x] 测试：10 种齐全；default ∈ [min,max]；`toFilter` 输出格式；threshold 后 RGB 仅 0/255 且 alpha 不变；pixelate 后块内颜色一致
- [x] 跑测（红）→ 实现 → 跑测（绿）→ Commit `feat(tool-image-pipeline-lab): effect definitions`

### Task 3: 管线 reducer + undo/redo `src/lib/pipeline.ts` (+`pipeline.test.ts`)

**Consumes:** `EFFECTS`（取默认值）
**Produces:** `PipelineHistory {past,present,future,lastEditedId?}`、`initialHistory`、`newStep(effect)`、`pipelineReducer(h, action)`；
actions：`add/remove/move(dir:±1)/toggle/setValue/replace(steps)/undo/redo`

规则：编辑动作 push past 并清空 future；`setValue` 对同一 id 连续调参合并为一条历史（`lastEditedId`）；`move` 越界、`remove` 不存在 id 时原样返回；undo/redo 空栈为 no-op。

- [x] 测试：add 用默认值；remove/move/toggle；setValue 合并（连续两次同 id 调参 → 一次 undo 回到调参前）；undo/redo round-trip；replace 清历史外全量替换
- [x] 红 → 实现 → 绿 → Commit `feat(tool-image-pipeline-lab): pipeline reducer with undo/redo`

### Task 4: 持久化 `src/lib/storage.ts` (+`storage.test.ts`)

**Consumes:** `EFFECTS`（校验 type、clamp value）
**Produces:** `listPipelines():SavedPipeline[]`、`savePipeline(name,steps)`（按名 upsert）、`deletePipeline(name)`、`serializePipeline(steps):string`（`{version:1,steps:[{type,value,enabled}]}`）、`parsePipelineJson(text):PipelineStep[]`（非法抛 Error，value clamp 到范围，重新生成 id）
localStorage key：`toolbox.image-pipeline-lab.pipelines.v1`

- [x] 测试：save→list→delete round-trip；serialize→parse 复原 type/value/enabled；非法 JSON / 未知 type / steps 非数组 抛错；越界 value 被 clamp
- [x] 红 → 实现 → 绿 → Commit `feat(tool-image-pipeline-lab): pipeline persistence + JSON import/export`

## 并行组 3（渲染 + UI 集成，依赖组 2）

### Task 5: canvas 渲染 `src/lib/render.ts`

**Produces:** `applyPipeline(source: HTMLImageElement|HTMLCanvasElement, steps: PipelineStep[], target: HTMLCanvasElement): void`
target 尺寸=源图原始尺寸；逐个启用步骤：filter 类经临时 canvas `ctx.filter` 重绘；pixel 类 `getImageData`→`applyPixel`→`putImageData`。无单测（jsdom 无 2D context），由 build+手工验收覆盖。

- [x] 实现 → Commit `feat(tool-image-pipeline-lab): canvas render engine`

### Task 6: 主组件 `src/ImagePipelineLab.tsx` + i18n

**Consumes:** 全部 lib 导出
布局：左侧图像加载区（file input + 拖拽）+ 预览 canvas + 尺寸信息；右侧步骤面板（下拉添加效果、每步：名称/滑杆/开关/上移/下移/删除）；顶部工具栏（撤销/重做/导出 PNG/保存流程(命名)/已存流程列表(加载/删除)/导出 JSON/导入 JSON）。
`useReducer(pipelineReducer)`；`useEffect` 在 [image, present] 变化时 `applyPipeline`；Cmd/Ctrl+Z 撤销、Shift+Cmd/Ctrl+Z 重做；导入非法 JSON 显示错误不破坏当前管线；导出 PNG 走 `canvas.toBlob`。
i18n：`locales/zh.json`/`en.json` 覆盖 title/description/upload/effects.<type>/steps/toolbar/saved/errors 全部文案。

- [x] 实现 + i18n → `pnpm test` 全绿 → Commit `feat(tool-image-pipeline-lab): main UI + i18n`

## 并行组 4（验收，串行）

### Task 7: 质量关卡

- [x] `pnpm check:consistency && pnpm lint && pnpm test && pnpm -C apps/web build` 全过，失败就地修
