# Change: Add Sudoku Kids Tool

## Why
工具箱的 learning 分类目前缺乏面向儿童的逻辑/数学启蒙小游戏。为低龄用户提供一款带闯关、难度递进、错题反馈与提示的数独，可以同时承担"娱乐"与"学习"两层价值：让孩子在分级递进中建立行/列/宫互斥的逻辑直觉，培养专注与试错复盘。

## What Changes
- 新增工具包 `tools/tool-sudoku-kids/`（manifest-first），路径 `/sudoku-kids`，归类 `learning`。
- 提供三档难度：4×4 入门（2×2 宫）、6×6 进阶（2×3 宫）、9×9 标准（3×3 宫）。
- 实现闯关模式：每档 10 关、共 30 关；上一关达 1★ 即解锁下一关。
- 三星评分：基础 3 星，每次"使用提示"或"填入错误数字"扣 1 星，下限 1 星。
- 学习辅助：候选数字（铅笔）模式、错误即时高亮、单步撤销、单格提示按钮。
- 进度持久化：localStorage 保存每关的最佳星数与解锁状态。
- 题目生成：纯前端算法（行/列/宫的 backtracking + 对称挖洞），按难度配置已知格数；用固定种子保证每关跨设备一致。
- 国际化：zh / en 两套 locale。
- 图片：先用 lucide-react 图标 + emoji 装饰；预留 `apps/web/public/sudoku-kids/` 目录，后续可替换 PNG 插画。
- 后端：无（纯前端，不触及 `apps/api-gateway`）。

## Impact
- **Specs affected**: 新增能力 `sudoku-kids`（games / learning 子域）。
- **Code affected**:
  - 新工具目录 `tools/tool-sudoku-kids/`（manifest + 组件 + locales + 题库/算法/状态）。
  - 通过 manifest 自动发现，无需修改 `apps/web/src/config/a-learning-tools.ts`（参考 bird-smash 已建立的 manifest-only 模式）。
- **Build**: 增量打包一个 lazy chunk，预计 < 30 KB gzip。
- **Runtime**: 仅 localStorage 持久化，不联网；移动端 + 桌面端响应式适配。
- **Tests**: 单元测试覆盖 sudoku 生成 / 验证 / 评分 / 进度存取的核心纯函数。

## Out of Scope（明确不做）
- 多人对战、排行榜、社交分享。
- 服务端题库 / 云端进度同步。
- 自定义题目导入 / 自定义难度参数。
- 第三方账号登录。
