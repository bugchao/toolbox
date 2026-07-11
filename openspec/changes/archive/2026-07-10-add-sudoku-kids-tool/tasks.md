# Tasks for Adding Sudoku Kids Tool

## 并行组 1 — 基础设施
- [x] 1.1 `pnpm create:tool sudoku-kids` 脚手架；`pnpm install` 链接 workspace。
- [x] 1.2 配置 `tool.manifest.ts`：`categoryKey='learning'`、`icon=Grid3x3`、`keywords`、`meta.zh/en`。
- [x] 1.3 定义核心类型：`Cell`、`Board`、`Difficulty`、`LevelId`、`Move`、`Progress`。

## 并行组 2 — 纯函数核心（可并行）
- [x] 2.1 `lib/generator.ts`：基于种子的回溯生成（4×4 / 6×6 / 9×9）+ 单元测试（行/列/宫互斥、唯一解校验）。
- [x] 2.2 `lib/validator.ts`：判断盘面是否合法 / 是否完成 / 单格冲突检测 + 测试。
- [x] 2.3 `lib/scoring.ts`：错误计数 + 提示计数 → 星数（下限 1）+ 测试。
- [x] 2.4 `lib/storage.ts`：localStorage 读写进度（关卡解锁、最佳星数）+ 测试（mock storage）。
- [x] 2.5 `lib/levels.ts`：30 关元数据（id / difficulty / seed / 给定格数）+ 工具函数（按难度过滤、下一关解锁判断）+ 测试。

## 并行组 3 — UI 组件（依赖组 2 的类型，但 UI 间可并行）
- [x] 3.1 `components/LevelMap.tsx`：闯关地图（三档分区，关卡卡片含锁/星数）。
- [x] 3.2 `components/Board.tsx`：响应式 N×N 盘面，含选中/同行同列/同宫高亮、错误高亮。
- [x] 3.3 `components/NumberPad.tsx`：1–N 数字按钮 + 铅笔切换 + 提示/撤销/清除。
- [x] 3.4 `components/StarRating.tsx`：通用三星组件。
- [x] 3.5 `components/CompletionDialog.tsx`：关卡通关弹窗（星数 + 重玩 / 下一关 / 返回地图）。

## 并行组 4 — 集成与持久化
- [x] 4.1 `state/useSudokuGame.ts`：单关游戏状态（盘面、铅笔层、错误数、提示数、历史栈）。
- [x] 4.2 `state/useProgress.ts`：跨关进度（解锁 / 最佳星数），桥接 storage。
- [x] 4.3 `SudokuKids.tsx` 主组件：路由"地图 ↔ 关卡"两态切换、键盘事件、CompletionDialog 接入。
- [x] 4.4 i18n：`src/locales/zh.json`、`src/locales/en.json` 完整覆盖。

## 并行组 5 — 质量
- [x] 5.1 单元测试：generator / validator / scoring / storage / levels 全绿。
- [x] 5.2 lint：`pnpm lint` 0 warning / error。
- [x] 5.3 build：`pnpm -C apps/web build` 成功。
- [x] 5.4 一致性：`pnpm check:consistency` 不引入新的 ERROR。

## 后续（不阻塞 PR）
- [x] 6.1 替换 `apps/web/public/sudoku-kids/` 占位图为实际插画（codex gptimages 或人工出图）。
