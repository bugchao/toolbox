// 数独核心类型

export type Difficulty = 'easy' | 'medium' | 'hard'

/** 每档对应的盘面尺寸与宫格切分 */
export type BoardSpec = {
  size: number // 边长 N
  boxRows: number // 子宫行数
  boxCols: number // 子宫列数
}

export const SPECS: Record<Difficulty, BoardSpec> = {
  easy: { size: 4, boxRows: 2, boxCols: 2 },
  medium: { size: 6, boxRows: 2, boxCols: 3 },
  hard: { size: 9, boxRows: 3, boxCols: 3 },
}

/** 单元格的数字 (1..N)；0 表示空 */
export type CellValue = number

/** 一个 N×N 盘面 */
export type Board = CellValue[][]

/** 关卡 ID：`<difficulty>:<index>` (index 从 1 开始) */
export type LevelId = string

export type Level = {
  id: LevelId
  difficulty: Difficulty
  index: number // 1..10
  givens: number // 已知格数
}

/** 用户在某格的输入状态 */
export type CellEntry = {
  /** 用户填入的值；0 表示空 */
  value: CellValue
  /** 候选数字（铅笔模式记的小数字） */
  candidates: Set<number>
  /** 是否为初始已知格（不可编辑） */
  given: boolean
  /** 是否为提示锁定（提示填入后不可改） */
  hinted: boolean
}

/** 操作历史的一步（用于撤销） */
export type Move =
  | { kind: 'set'; row: number; col: number; prev: CellEntry }
  | { kind: 'pencil'; row: number; col: number; prev: Set<number> }
  | { kind: 'clear'; row: number; col: number; prev: CellEntry }
