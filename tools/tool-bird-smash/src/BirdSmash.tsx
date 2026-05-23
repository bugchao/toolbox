import React from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { GameCanvas } from './components/GameCanvas'
import { useGameStore, LEVELS, GameStatus } from './state/gameStore'
import { playSound } from './utils/audio'
import { Play, RotateCcw, Volume2, VolumeX, Award, Gamepad2, ArrowLeft, X, Trophy } from 'lucide-react'

const BirdSmash: React.FC = () => {
  const { t } = useTranslation('toolBirdSmash')
  const {
    status,
    currentLevelIndex,
    levelScore,
    levelProgress,
    soundEnabled,
    setStatus,
    selectLevel,
    toggleSound,
    resetLevelProgress,
    completeLevel,
    unlockNextLevel
  } = useGameStore()

  const currentLevel = LEVELS[currentLevelIndex]

  // 计算当前得分的星级
  const getStarsForScore = (score: number, levelId: number) => {
    const lvl = LEVELS.find(l => l.id === levelId)
    if (!lvl) return 0
    if (score >= lvl.threeStarScore) return 3
    if (score >= lvl.twoStarScore) return 2
    if (score >= lvl.oneStarScore) return 1
    return 0
  }

  // 播放按钮声并改变状态
  const navigateTo = (newStatus: GameStatus) => {
    playSound('launch')
    setStatus(newStatus)
  }

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-start text-white select-none">
      {/* 动态粒子背景 */}
      <ParticlesBackground preset="minimal" className="absolute inset-0 z-0 pointer-events-none" />

      {/* 顶部标题栏 */}
      <div className="relative z-10 w-full max-w-[1000px] mb-6 flex justify-between items-center px-4 py-3 bg-white/5 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-xl border border-red-500/30 text-red-400">
            <Gamepad2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 bg-clip-text text-transparent">
              BIRD SMASH
            </h1>
            <p className="text-xs text-gray-400">物理弹射与技能爆破小游戏</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 声音开关 */}
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all active:scale-95"
            title={soundEnabled ? '关闭声音' : '开启声音'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-green-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </button>
          
          {/* 清除存档 */}
          <button
            onClick={() => {
              if (confirm('确定要清除所有关卡记录和高分吗？')) {
                resetLevelProgress()
                navigateTo('start')
              }
            }}
            className="text-xs px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 rounded-xl transition"
          >
            重置进度
          </button>
        </div>
      </div>

      {/* 核心游戏状态渲染 */}
      <div className="relative z-10 w-full max-w-[1000px] flex-1 flex flex-col justify-center items-center">
        {status === 'start' && (
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-950/80 to-purple-950/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl text-center max-w-[500px] w-full py-12 animate-fade-in">
            {/* 炫酷的物理小鸟插画/设计 */}
            <div className="relative w-36 h-36 mb-8 flex items-center justify-center bg-gradient-to-tr from-yellow-500 to-red-500 rounded-full shadow-2xl shadow-red-500/20 border-4 border-white/20">
              <div className="absolute w-8 h-8 bg-black rounded-full top-8 left-8 flex items-center justify-center border-2 border-white">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <div className="absolute w-8 h-8 bg-black rounded-full top-8 right-8 flex items-center justify-center border-2 border-white">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <div className="absolute w-12 h-6 bg-orange-500 rounded-b-full bottom-8 border-2 border-orange-600" />
            </div>

            <h2 className="text-3xl font-black text-yellow-400 mb-2 drop-shadow-lg tracking-wider">
              BIRD SMASH
            </h2>
            <p className="text-gray-300 text-sm mb-8 px-6">
              拉动弹弓，瞄准并发射不同颜色的小鸟，摧毁物理防线，打倒躲在里面的小绿猪！
            </p>

            <button
              onClick={() => navigateTo('level_select')}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-extrabold text-lg shadow-lg hover:shadow-red-500/30 hover:scale-105 transition-all duration-200"
            >
              <Play className="w-6 h-6 fill-white group-hover:scale-110 transition" />
              开始游戏
            </button>
          </div>
        )}

        {status === 'level_select' && (
          <div className="w-full bg-white/5 dark:bg-gray-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => navigateTo('start')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-black text-yellow-300">选择关卡 (Select Level)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {LEVELS.map((level, idx) => {
                const prog = levelProgress[level.id] || { unlocked: idx === 0, stars: 0, highScore: 0 }
                const isUnlocked = prog.unlocked

                return (
                  <div
                    key={level.id}
                    onClick={() => isUnlocked && selectLevel(idx)}
                    className={`relative overflow-hidden flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 h-52 select-none ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900/50 hover:to-indigo-900/30 border-white/10 hover:border-yellow-400/40 hover:-translate-y-1.5 cursor-pointer shadow-lg hover:shadow-yellow-500/10'
                        : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-indigo-300 font-bold tracking-widest uppercase">
                          LEVEL 0{level.id}
                        </span>
                        {!isUnlocked && (
                          <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-bold">
                            未解锁
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-white leading-tight mb-2 truncate">
                        {level.name}
                      </h3>
                      
                      {/* 星级徽章 */}
                      {isUnlocked && (
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3].map((s) => (
                            <Award
                              key={s}
                              className={`w-5 h-5 ${
                                s <= prog.stars ? 'text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {isUnlocked && (
                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="text-[10px] text-gray-400">
                          最高分: <span className="font-mono text-yellow-400 font-bold">{prog.highScore}</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-400 group-hover:text-yellow-400 flex items-center gap-1">
                          进入挑战 &rarr;
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 正在进行游戏 */}
        {status === 'playing' && <GameCanvas />}

        {/* 关卡结算：成功通关 */}
        {status === 'cleared' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
            <div className="w-full max-w-[450px] bg-gradient-to-b from-indigo-950 to-slate-900 border-2 border-yellow-400/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
              {/* 光影旋转背景 */}
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.15)_0%,transparent_70%)] animate-pulse" />

              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 filter drop-shadow-[0_0_10px_rgba(250,204,21,0.4)] animate-bounce" />

              <h2 className="text-3xl font-black text-yellow-400 mb-2 drop-shadow-md">
                通关成功！
              </h2>
              <p className="text-indigo-200 text-sm mb-6">{currentLevel.name}</p>

              {/* 评分星星 */}
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3].map((starIndex) => {
                  const currentStars = getStarsForScore(levelScore, currentLevel.id)
                  const hasStar = starIndex <= currentStars
                  return (
                    <Award
                      key={starIndex}
                      className={`w-14 h-14 transition-all duration-700 ${
                        hasStar
                          ? 'text-yellow-400 fill-yellow-400 scale-110 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                          : 'text-gray-700 scale-90'
                      }`}
                    />
                  )
                })}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
                <div className="text-xs text-gray-400 mb-1">FINAL SCORE</div>
                <div className="text-3xl font-black text-yellow-400 font-mono tracking-widest">{levelScore}</div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    playSound('launch')
                    unlockNextLevel()
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 font-extrabold text-white hover:scale-[1.02] active:scale-98 transition shadow-lg shadow-orange-500/20"
                >
                  {currentLevelIndex < LEVELS.length - 1 ? '下一关卡' : '返回关卡选择'}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => selectLevel(currentLevelIndex)}
                    className="py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重玩本关
                  </button>
                  <button
                    onClick={() => navigateTo('level_select')}
                    className="py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold transition"
                  >
                    关卡列表
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 关卡结算：挑战失败 */}
        {status === 'failed' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
            <div className="w-full max-w-[450px] bg-gradient-to-b from-slate-900 to-zinc-950 border-2 border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <X className="w-10 h-10 text-red-500" />
              </div>

              <h2 className="text-3xl font-black text-red-500 mb-2">
                挑战失败
              </h2>
              <p className="text-gray-400 text-sm mb-6">哎呀，小鸟用光了，还有绿猪存活！</p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
                <div className="text-xs text-gray-400 mb-1">SCORE</div>
                <div className="text-2xl font-bold text-gray-300 font-mono">{levelScore}</div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => selectLevel(currentLevelIndex)}
                  className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-600 font-extrabold text-white hover:scale-[1.02] active:scale-98 transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  重试本关
                </button>
                <button
                  onClick={() => navigateTo('level_select')}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold transition"
                >
                  返回关卡列表
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BirdSmash
