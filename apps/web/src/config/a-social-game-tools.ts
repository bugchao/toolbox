// 社交游戏工具配置 - Social Games
// 适用：桌游/聚会/抽签/随机互动类工具

import type { ToolEntry } from './tools'
import { Dices, MessageCircleQuestion, UserSearch, Binary, Moon } from 'lucide-react'

export const SOCIAL_GAME_TOOLS: ToolEntry[] = [
  { path: '/dice-roller', nameKey: 'tools.dice_roller', icon: Dices, categoryKey: 'social_game', keywords: ['骰子', '随机', 'dice', '桌游', '大话骰', '色子'] },
  { path: '/truth-dare', nameKey: 'tools.truth_dare', icon: MessageCircleQuestion, categoryKey: 'social_game', keywords: ['真心话', '大冒险', '聚会', 'truth', 'dare', 'party', '游戏'] },
  { path: '/undercover-game', nameKey: 'tools.undercover_game', icon: UserSearch, categoryKey: 'social_game', keywords: ['谁是卧底', '卧底', '推理', '桌游', '聚会', 'undercover', 'spyfall'] },
  { path: '/guess-number', nameKey: 'tools.guess_number', icon: Binary, categoryKey: 'social_game', keywords: ['猜数字', '小游戏', '二分', 'guess', 'number'] },
  { path: '/werewolf', nameKey: 'tools.werewolf', icon: Moon, categoryKey: 'social_game', keywords: ['狼人杀', '桌游', '聚会', '预言家', '女巫', 'werewolf', 'mafia'] },
]
