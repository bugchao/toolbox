// 社交游戏工具配置 - Social Games
// 适用：桌游/聚会/抽签/随机互动类工具

import type { ToolEntry } from './tools'
import { Dices } from 'lucide-react'

export const SOCIAL_GAME_TOOLS: ToolEntry[] = [
  { path: '/dice-roller', nameKey: 'tools.dice_roller', icon: Dices, categoryKey: 'social_game', keywords: ['骰子', '随机', 'dice', '桌游', '大话骰', '色子'] },
]
