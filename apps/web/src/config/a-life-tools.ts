// 生活工具配置 - Life Tools
// 包含：健康/效率/财务/创意/实用等工具

import type { ToolEntry } from './tools'
import {
  Timer, CalendarCheck, DollarSign, ArrowLeftRight, KeyRound, Receipt,
  CreditCard, Flame, UtensilsCrossed, Coins, Flag, ClipboardCheck, PlaneTakeoff,
  Percent, Watch, Milestone, Luggage, ChefHat, Moon, Droplets, Footprints,
  PersonStanding, Dumbbell, CalendarRange, Palette, Code2, HeartPulse,
  TimerOff, ListChecks, Backpack, SplitSquareHorizontal, Heart
} from 'lucide-react'

export const LIFE_TOOLS: ToolEntry[] = [
  // 健康生活（6 个）
  { path: '/pomodoro', nameKey: 'tools.pomodoro', icon: TimerOff, categoryKey: 'life', keywords: ['番茄钟', '专注', '计时', 'pomodoro'], i18nNamespace: 'toolPomodoro' },
  { path: '/habit-tracker', nameKey: 'tools.habit_tracker', icon: CalendarCheck, categoryKey: 'life', keywords: ['习惯', '打卡', '连续', '追踪'], i18nNamespace: 'toolHabitTracker' },
  { path: '/calorie-calc', nameKey: 'tools.calorie_calc', icon: Flame, categoryKey: 'life', keywords: ['卡路里', '热量', '饮食', '营养'], i18nNamespace: 'toolCalorieCalc' },
  { path: '/water-reminder', nameKey: 'tools.water_reminder', icon: Droplets, categoryKey: 'life', keywords: ['饮水', '喝水', '健康', 'water'], i18nNamespace: 'toolWaterReminder' },
  { path: '/running-tracker', nameKey: 'tools.running_tracker', icon: Footprints, categoryKey: 'life', keywords: ['跑步', '运动', '里程', 'running'], i18nNamespace: 'toolRunningTracker' },
  { path: '/sedentary-reminder', nameKey: 'tools.sedentary_reminder', icon: PersonStanding, categoryKey: 'life', keywords: ['久坐', '提醒', '拉伸', '健康'], i18nNamespace: 'toolSedentaryReminder' },

  // 财务工具（5 个）
  { path: '/salary-calc', nameKey: 'tools.salary_calc', icon: DollarSign, categoryKey: 'life', keywords: ['工资', '税后', '五险一金', '个税'], i18nNamespace: 'toolSalaryCalc' },
  { path: '/currency-converter', nameKey: 'tools.currency_converter', icon: ArrowLeftRight, categoryKey: 'life', keywords: ['汇率', '换算', '货币', '外汇'], i18nNamespace: 'toolCurrencyConverter' },
  { path: '/expense-tracker', nameKey: 'tools.expense_tracker', icon: Receipt, categoryKey: 'life', keywords: ['记账', '支出', '消费', '财务'], i18nNamespace: 'toolExpenseTracker' },
  { path: '/subscription-manager', nameKey: 'tools.subscription_manager', icon: CreditCard, categoryKey: 'life', keywords: ['订阅', 'netflix', 'ai', '费用'], i18nNamespace: 'toolSubscriptionManager' },
  { path: '/installment-calc', nameKey: 'tools.installment_calc', icon: Coins, categoryKey: 'life', keywords: ['分期', '贷款', '还款', '利率'], i18nNamespace: 'toolInstallmentCalc' },

  // 生活实用（7 个）
  { path: '/random-menu', nameKey: 'tools.random_menu', icon: UtensilsCrossed, categoryKey: 'life', keywords: ['菜单', '吃什么', '随机', '美食'], i18nNamespace: 'toolRandomMenu' },
  { path: '/recipe-finder', nameKey: 'tools.recipe_finder', icon: ChefHat, categoryKey: 'life', keywords: ['菜谱', '食材', '烹饪', '推荐'], i18nNamespace: 'toolRecipeFinder' },
  { path: '/okr-planner', nameKey: 'tools.okr_planner', icon: Flag, categoryKey: 'life', keywords: ['okr', '目标', '计划', '季度'], i18nNamespace: 'toolOkrPlanner' },
  { path: '/fitness-planner', nameKey: 'tools.fitness_planner', icon: Dumbbell, categoryKey: 'life', keywords: ['健身', '训练', '计划', 'fitness'], i18nNamespace: 'toolFitnessPlanner' },
  { path: '/meeting-scheduler', nameKey: 'tools.meeting_scheduler', icon: CalendarRange, categoryKey: 'life', keywords: ['会议', '时区', '时间', 'meeting'], i18nNamespace: 'toolMeetingScheduler' },
  { path: '/wooden-fish', nameKey: 'tools.wooden_fish', icon: HeartPulse, categoryKey: 'life', keywords: ['木鱼', '功德', '解压'], i18nNamespace: 'toolWoodenFish' },
  { path: '/life-progress', nameKey: 'tools.life_progress', icon: Timer, categoryKey: 'life', keywords: ['人生', '进度条', '生命'], i18nNamespace: 'toolLifeProgress' },
]
