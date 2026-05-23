import { create } from 'zustand'

export type GameStatus = 'start' | 'level_select' | 'playing' | 'paused' | 'cleared' | 'failed'

export type BirdType = 'red' | 'yellow' | 'blue' | 'black'
export type BlockMaterial = 'wood' | 'stone' | 'glass'
export type BlockShape = 'rect' | 'circle'

export interface LevelConfig {
  id: number
  name: string
  birds: BirdType[]
  structures: {
    shape: BlockShape
    x: number
    y: number
    w: number
    h: number
    material: BlockMaterial
    health: number
  }[]
  enemies: {
    x: number
    y: number
    r: number
    health: number
  }[]
  threeStarScore: number
  twoStarScore: number
  oneStarScore: number
}

// 预定义 4 个关卡
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '新手试炼 (First Flight)',
    birds: ['red', 'red', 'yellow'],
    structures: [
      // 简单的木箱柱子
      { shape: 'rect', x: 750, y: 480, w: 40, h: 120, material: 'wood', health: 40 },
      { shape: 'rect', x: 850, y: 480, w: 40, h: 120, material: 'wood', health: 40 },
      { shape: 'rect', x: 800, y: 410, w: 140, h: 20, material: 'glass', health: 15 },
    ],
    enemies: [
      { x: 800, y: 480, r: 20, health: 20 },
    ],
    oneStarScore: 5000,
    twoStarScore: 12000,
    threeStarScore: 20000,
  },
  {
    id: 2,
    name: '石墙突围 (Stone Castle)',
    birds: ['red', 'yellow', 'blue'],
    structures: [
      // 石柱和木箱
      { shape: 'rect', x: 720, y: 480, w: 30, h: 140, material: 'stone', health: 150 },
      { shape: 'rect', x: 880, y: 480, w: 30, h: 140, material: 'stone', health: 150 },
      { shape: 'rect', x: 800, y: 480, w: 60, h: 60, material: 'wood', health: 50 },
      { shape: 'rect', x: 800, y: 400, w: 190, h: 20, material: 'wood', health: 50 },
      { shape: 'rect', x: 800, y: 350, w: 40, h: 80, material: 'glass', health: 15 },
    ],
    enemies: [
      { x: 800, y: 520, r: 20, health: 25 },
      { x: 800, y: 320, r: 18, health: 15 },
    ],
    oneStarScore: 10000,
    twoStarScore: 25000,
    threeStarScore: 40000,
  },
  {
    id: 3,
    name: '玻璃迷宫 (Glass Maze)',
    birds: ['blue', 'blue', 'black'],
    structures: [
      // 大量玻璃碎渣结构，配有黑鸟爆炸
      { shape: 'rect', x: 700, y: 490, w: 20, h: 100, material: 'glass', health: 15 },
      { shape: 'rect', x: 760, y: 490, w: 20, h: 100, material: 'glass', health: 15 },
      { shape: 'rect', x: 820, y: 490, w: 20, h: 100, material: 'glass', health: 15 },
      { shape: 'rect', x: 880, y: 490, w: 20, h: 100, material: 'glass', health: 15 },
      { shape: 'rect', x: 790, y: 430, w: 200, h: 20, material: 'wood', health: 50 },
      { shape: 'rect', x: 740, y: 370, w: 30, h: 100, material: 'stone', health: 150 },
      { shape: 'rect', x: 840, y: 370, w: 30, h: 100, material: 'stone', health: 150 },
    ],
    enemies: [
      { x: 730, y: 490, r: 16, health: 20 },
      { x: 790, y: 490, r: 16, health: 20 },
      { x: 850, y: 490, r: 16, health: 20 },
      { x: 790, y: 370, r: 22, health: 30 },
    ],
    oneStarScore: 15000,
    twoStarScore: 35000,
    threeStarScore: 55000,
  },
  {
    id: 4,
    name: '终极决战 (TNT Fortress)',
    birds: ['red', 'yellow', 'blue', 'black'],
    structures: [
      // 混合结构
      { shape: 'rect', x: 680, y: 470, w: 40, h: 140, material: 'stone', health: 180 },
      { shape: 'rect', x: 880, y: 470, w: 40, h: 140, material: 'stone', health: 180 },
      { shape: 'rect', x: 780, y: 470, w: 30, h: 140, material: 'wood', health: 60 },
      { shape: 'rect', x: 780, y: 390, w: 240, h: 20, material: 'stone', health: 150 },
      // 二层
      { shape: 'rect', x: 730, y: 320, w: 30, h: 120, material: 'wood', health: 50 },
      { shape: 'rect', x: 830, y: 320, w: 30, h: 120, material: 'wood', health: 50 },
      { shape: 'rect', x: 780, y: 250, w: 130, h: 20, material: 'glass', health: 15 },
    ],
    enemies: [
      { x: 730, y: 470, r: 20, health: 25 },
      { x: 830, y: 470, r: 20, health: 25 },
      { x: 780, y: 320, r: 24, health: 40 },
    ],
    oneStarScore: 20000,
    twoStarScore: 45000,
    threeStarScore: 70000,
  }
]

interface LevelProgress {
  unlocked: boolean
  stars: number
  highScore: number
}

interface GameState {
  status: GameStatus
  currentLevelIndex: number
  score: number
  levelScore: number // 当前关卡累计得分
  birdsUsed: number
  levelProgress: Record<number, LevelProgress>
  soundEnabled: boolean
  
  // Actions
  setStatus: (status: GameStatus) => void
  selectLevel: (index: number) => void
  addScore: (points: number) => void
  useBird: () => void
  toggleSound: () => void
  resetLevelProgress: () => void
  completeLevel: (score: number) => void
  failLevel: () => void
  unlockNextLevel: () => void
}

const getInitialProgress = (): Record<number, LevelProgress> => {
  const local = typeof window !== 'undefined' ? localStorage.getItem('bird_smash_progress') : null
  if (local) {
    try {
      return JSON.parse(local)
    } catch {
      // fallback
    }
  }

  // 默认第一关解锁，其余锁定
  const progress: Record<number, LevelProgress> = {}
  LEVELS.forEach((level, idx) => {
    progress[level.id] = {
      unlocked: idx === 0,
      stars: 0,
      highScore: 0
    }
  })
  return progress
}

export const useGameStore = create<GameState>((set, get) => ({
  status: 'start',
  currentLevelIndex: 0,
  score: 0,
  levelScore: 0,
  birdsUsed: 0,
  levelProgress: getInitialProgress(),
  soundEnabled: true,

  setStatus: (status) => set({ status }),
  
  selectLevel: (index) => set({
    currentLevelIndex: index,
    levelScore: 0,
    birdsUsed: 0,
    status: 'playing'
  }),

  addScore: (points) => set((state) => ({
    levelScore: state.levelScore + points,
    score: state.score + points
  })),

  useBird: () => set((state) => ({
    birdsUsed: state.birdsUsed + 1
  })),

  toggleSound: () => set((state) => ({
    soundEnabled: !state.soundEnabled
  })),

  resetLevelProgress: () => {
    const progress: Record<number, LevelProgress> = {}
    LEVELS.forEach((level, idx) => {
      progress[level.id] = {
        unlocked: idx === 0,
        stars: 0,
        highScore: 0
      }
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('bird_smash_progress', JSON.stringify(progress))
    }
    set({ levelProgress: progress, score: 0 })
  },

  completeLevel: (finalScore) => {
    const { currentLevelIndex, levelProgress } = get()
    const currentLevel = LEVELS[currentLevelIndex]
    
    // 计算星级
    let stars = 0
    if (finalScore >= currentLevel.threeStarScore) stars = 3
    else if (finalScore >= currentLevel.twoStarScore) stars = 2
    else if (finalScore >= currentLevel.oneStarScore) stars = 1

    const progressCopy = { ...levelProgress }
    const currentProg = progressCopy[currentLevel.id]
    
    // 更新当前关卡数据
    progressCopy[currentLevel.id] = {
      unlocked: true,
      stars: Math.max(currentProg?.stars || 0, stars),
      highScore: Math.max(currentProg?.highScore || 0, finalScore)
    }

    // 解锁下一关
    const nextLevel = LEVELS[currentLevelIndex + 1]
    if (nextLevel) {
      progressCopy[nextLevel.id] = {
        ...progressCopy[nextLevel.id],
        unlocked: true
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('bird_smash_progress', JSON.stringify(progressCopy))
    }

    set({
      levelProgress: progressCopy,
      status: 'cleared'
    })
  },

  failLevel: () => set({ status: 'failed' }),

  unlockNextLevel: () => {
    const { currentLevelIndex } = get()
    if (currentLevelIndex < LEVELS.length - 1) {
      set({
        currentLevelIndex: currentLevelIndex + 1,
        levelScore: 0,
        birdsUsed: 0,
        status: 'playing'
      })
    } else {
      set({ status: 'level_select' })
    }
  }
}))
