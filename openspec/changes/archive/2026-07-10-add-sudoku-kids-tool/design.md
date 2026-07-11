# Design Notes: sudoku-kids

## 关键算法：数独生成

### 终盘生成（回溯）
统一处理 N×N（N ∈ {4, 6, 9}），子宫尺寸 = (rows, cols)：
- 4×4 → 2 行 × 2 列
- 6×6 → 2 行 × 3 列（6 = 2*3，宫为 2 行 3 列）
- 9×9 → 3 行 × 3 列

算法：
1. 用种子化 PRNG（mulberry32）打乱 1..N 序列；
2. 在 (0,0) 起点回溯，每格枚举随机顺序的合法候选；
3. 命中 N 行则得到完整解 `Solution: number[N][N]`。

### 挖洞 + 唯一解
- 按种子化随机顺序遍历所有格子；
- 尝试把当前格挖空，跑一遍"求解器（最多找 2 个解）"，若仍唯一解 → 保留挖空，否则回填；
- 直到达到目标已知格数或遍历完成。

### 难度参数（已知格数 / 总格数）
| 难度 | 总格 | 入门 L1-L3 | 中段 L4-L7 | 末段 L8-L10 |
|------|------|-----------|-----------|------------|
| 4×4  | 16   | 10         | 8          | 6           |
| 6×6  | 36   | 22         | 18         | 14          |
| 9×9  | 81   | 45         | 38         | 32          |

### 种子约定
`seed = hash("sudoku-kids:" + difficulty + ":" + levelIndex)`，cross-device 一致。

## 状态机概览

```
LevelMap ──选关──▶ GameScreen ──通关──▶ CompletionDialog ──回地图──▶ LevelMap
                       │
                       └─返回──▶ LevelMap
```

GameScreen 内部状态：
- `puzzle`: 初始盘面（只读，含锁定标记）
- `solution`: 终盘（只读）
- `entries`: 用户填入（含值/铅笔候选/锁定提示标记）
- `errors`: 已扣分的"错填次数"
- `hints`: 已扣分的"提示次数"
- `history`: 操作栈（撤销用）
- `selected`: 当前选中坐标
- `mode`: 'confirm' | 'pencil'

## 评分

```
stars = max(1, 3 - errors - hints)
```
- `errors`: 累计错填次数（撤销不抵消）
- `hints`: 累计使用提示次数

## 持久化结构

```ts
type StoredProgress = {
  v: 1
  best: { [levelId: string]: number /* 1..3 */ }
}
key = 'toolbox.sudoku-kids.progress'
```

解锁逻辑：每档 L1 默认解锁；L(i) 解锁条件 = L(i-1).best ≥ 1。

## 模块依赖图

```
generator.ts ◀─┐
validator.ts ◀─┼── useSudokuGame.ts ── SudokuKids.tsx ─┬─ LevelMap.tsx
scoring.ts   ◀─┤                                      ├─ Board.tsx
levels.ts    ◀─┘                                      ├─ NumberPad.tsx
storage.ts  ◀── useProgress.ts                        ├─ StarRating.tsx
                                                      └─ CompletionDialog.tsx
```

并行性：
- **组 1 (基础设施)**：必须先于其他组完成（scaffold + types）。
- **组 2 (纯函数)** 5 个子模块可完全并行（generator / validator / scoring / storage / levels）。
- **组 3 (UI)** 5 个组件互不依赖，但都依赖组 1 的类型；可并行。
- **组 4 (集成)**：state hooks 依赖组 2 输出；主组件 SudokuKids 依赖组 3 + 组 4 的 hooks，**必须串行最后做**。
- **组 5 (质量)**：全部完成后才能跑。

## 测试边界 (TDD 要点)

- `generator.test.ts`：固定 seed → 同一盘面；解唯一性；行/列/宫互斥。
- `validator.test.ts`：合法解 / 缺失 / 冲突 3 类输入。
- `scoring.test.ts`：边界（0/0 → 3 星；5/0 → 1 星）。
- `storage.test.ts`：mock localStorage；version 字段；不存在时返回空默认。
- `levels.test.ts`：30 关 ID 完整；isUnlocked 依赖前一关的 best ≥ 1。

## 不在本次范围

- WebWorker 加速 9×9 生成（先用主线程同步即可，预估 < 50ms）。
- 复杂动画（用 ui-kit 的 FadeIn 即可）。
- 移动端手势优化（保留基础 tap，后续可加 long-press）。
