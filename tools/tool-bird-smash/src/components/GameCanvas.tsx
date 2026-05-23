import React, { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { LEVELS, useGameStore, BirdType, BlockMaterial } from '../state/gameStore'
import { playSound } from '../utils/audio'

// 颜色常量
const COLORS = {
  sky: '#E0F2FE',
  ground: '#4ADE80',
  groundDark: '#22C55E',
  wood: '#D97706',
  woodLight: '#F59E0B',
  stone: '#6B7280',
  stoneLight: '#9CA3AF',
  glass: '#93C5FD',
  glassLight: '#E0F2FE',
  pig: '#22C55E',
  pigDark: '#16A34A',
  pigFace: '#4ADE80',
  redBird: '#EF4444',
  yellowBird: '#EAB308',
  blueBird: '#3B82F6',
  blackBird: '#1F2937',
  beak: '#F97316',
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  alpha: number
  decay: number
}

interface TrailPoint {
  x: number
  y: number
  alpha: number
}

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const {
    currentLevelIndex,
    addScore,
    useBird,
    completeLevel,
    failLevel,
    status
  } = useGameStore()

  const level = LEVELS[currentLevelIndex]

  // React 状态用于 HUD
  const [birdsLeft, setBirdsLeft] = useState<BirdType[]>([])
  const [currentBirdType, setCurrentBirdType] = useState<BirdType | null>(null)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // 物理与渲染引擎的引用
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderLoopRef = useRef<number | null>(null)
  
  // 弹弓与弹射状态
  const slingCenter = { x: 180, y: 440 }
  const slingMaxStretch = 120
  const [isDragging, setIsDragging] = useState(false)
  const [dragPos, setDragPos] = useState({ x: 180, y: 440 })
  
  // 游戏对象引用
  const activeBirdBodyRef = useRef<Matter.Body | null>(null)
  const spawnedBirdsRef = useRef<{ body: Matter.Body; type: BirdType; hasUsedAbility: boolean }[]>([])
  const blocksRef = useRef<{ body: Matter.Body; material: BlockMaterial; maxHealth: number; health: number }[]>([])
  const pigsRef = useRef<{ body: Matter.Body; maxHealth: number; health: number }[]>([])
  
  // 视觉效果
  const particlesRef = useRef<Particle[]>([])
  const trailsRef = useRef<TrailPoint[]>([])
  const cameraShakeRef = useRef({ x: 0, y: 0, magnitude: 0 })
  const [slowMo, setSlowMo] = useState(1) // 1 = 正常, 0.2 = 慢动作

  // 启动技能的标志
  const canTriggerAbilityRef = useRef(false)
  const birdsQueueRef = useRef<BirdType[]>([])
  const currentBirdTypeRef = useRef<BirdType | null>(null)
  const defeatTimerRef = useRef<number | null>(null)

  // 初始化关卡物理世界
  useEffect(() => {
    if (status !== 'playing') return

    // 1. 初始化 Matter.js Engine
    const engine = Matter.Engine.create({
      gravity: { y: 1.0 } // 正常重力
    })
    engineRef.current = engine
    const world = engine.world

    // 2. 创建边界 (地面、右墙、顶部屏障)
    const ground = Matter.Bodies.rectangle(500, 580, 1000, 40, {
      isStatic: true,
      friction: 0.8,
      render: { fillStyle: COLORS.ground }
    })
    const ceiling = Matter.Bodies.rectangle(500, -200, 1000, 40, { isStatic: true })
    const rightWall = Matter.Bodies.rectangle(1020, 300, 40, 600, { isStatic: true, friction: 0.5 })
    const leftWall = Matter.Bodies.rectangle(-20, 300, 40, 600, { isStatic: true })
    Matter.Composite.add(world, [ground, ceiling, rightWall, leftWall])

    // 3. 根据关卡配置生成结构体
    const blocks: typeof blocksRef.current = []
    level.structures.forEach((struct) => {
      let body: Matter.Body
      const options = {
        friction: 0.6,
        restitution: struct.material === 'glass' ? 0.1 : struct.material === 'wood' ? 0.3 : 0.05,
        density: struct.material === 'stone' ? 0.005 : struct.material === 'wood' ? 0.002 : 0.001,
      }

      if (struct.shape === 'rect') {
        body = Matter.Bodies.rectangle(struct.x, struct.y, struct.w, struct.h, options)
      } else {
        body = Matter.Bodies.circle(struct.x, struct.y, struct.w / 2, options)
      }

      blocks.push({
        body,
        material: struct.material,
        maxHealth: struct.health,
        health: struct.health
      })
    })
    Matter.Composite.add(world, blocks.map(b => b.body))
    blocksRef.current = blocks

    // 4. 根据关卡配置生成敌人 (Pigs)
    const pigs: typeof pigsRef.current = []
    level.enemies.forEach((enemy) => {
      const body = Matter.Bodies.circle(enemy.x, enemy.y, enemy.r, {
        friction: 0.5,
        restitution: 0.2,
        density: 0.0015,
        label: 'pig'
      })
      pigs.push({
        body,
        maxHealth: enemy.health,
        health: enemy.health
      })
    })
    Matter.Composite.add(world, pigs.map(p => p.body))
    pigsRef.current = pigs

    // 5. 初始化小鸟队列
    birdsQueueRef.current = [...level.birds]
    currentBirdTypeRef.current = level.birds[0] || null
    setBirdsLeft([...level.birds])
    setCurrentBirdType(level.birds[0] || null)
    setScore(0)
    setIsPaused(false)
    setSlowMo(1)
    particlesRef.current = []
    trailsRef.current = []
    spawnedBirdsRef.current = []
    activeBirdBodyRef.current = null
    canTriggerAbilityRef.current = false

    // 6. 注册碰撞事件，用于计算伤害和触发音效
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA
        const bodyB = pair.bodyB

        // 计算相对速度作为碰撞强度
        const velocityDiff = Matter.Vector.sub(bodyA.velocity, bodyB.velocity)
        const speed = Matter.Vector.magnitude(velocityDiff)

        if (speed > 1.5) {
          // 处理物块受损
          const damage = Math.round(speed * 3.5)
          
          const blockA = blocks.find(b => b.body === bodyA || b.body === bodyB)
          if (blockA) {
            blockA.health -= damage
            if (blockA.material === 'glass') playSound('glass_break')
            else if (blockA.material === 'wood') playSound('wood_hit')
            else playSound('stone_hit')
            
            // 产生火花/碎片粒子
            spawnDebris(blockA.body.position.x, blockA.body.position.y, blockA.material, Math.min(6, Math.floor(speed)))
            addScore(Math.round(speed * 20))
          }

          // 处理敌人受损
          const pig = pigs.find(p => p.body === bodyA || p.body === bodyB)
          if (pig) {
            pig.health -= damage
            playSound('pig_hit')
            spawnDebris(pig.body.position.x, pig.body.position.y, 'wood', 4) // 绿猪用木屑代替绿色碎屑
            addScore(Math.round(speed * 50))
          }

          // 触发屏幕震动
          if (speed > 6) {
            triggerCameraShake(speed * 0.8)
          }
        }
      })
    })

    // 销毁物理世界
    return () => {
      if (renderLoopRef.current) {
        cancelAnimationFrame(renderLoopRef.current)
      }
      if (defeatTimerRef.current) {
        clearTimeout(defeatTimerRef.current)
        defeatTimerRef.current = null
      }
      Matter.Composite.clear(world, false)
      Matter.Engine.clear(engine)
    }
  }, [currentLevelIndex, status])

  // 生成碎片粒子
  const spawnDebris = (x: number, y: number, material: BlockMaterial | 'pig', count: number) => {
    let color = COLORS.wood
    if (material === 'stone') color = COLORS.stone
    else if (material === 'glass') color = COLORS.glass
    else if (material === 'pig') color = COLORS.pig

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 4 + 1
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // 略微向上飞散
        color,
        size: Math.random() * 5 + 2,
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.015
      })
    }
  }

  // 触发相机震动
  const triggerCameraShake = (magnitude: number) => {
    cameraShakeRef.current.magnitude = Math.min(magnitude, 15)
  }

  // 触发慢动作
  const triggerSlowMotion = (durationMs = 1500) => {
    setSlowMo(0.2)
    setTimeout(() => {
      setSlowMo(1)
    }, durationMs)
  }

  // 准备发射下一只小鸟
  const prepareNextBird = (updatedQueue: BirdType[]) => {
    birdsQueueRef.current = updatedQueue
    const nextType = updatedQueue[0] || null
    currentBirdTypeRef.current = nextType

    if (updatedQueue.length > 0) {
      setCurrentBirdType(nextType)
      setBirdsLeft(updatedQueue)
      activeBirdBodyRef.current = null
      canTriggerAbilityRef.current = false
    } else {
      setCurrentBirdType(null)
      setBirdsLeft([])
      activeBirdBodyRef.current = null
      canTriggerAbilityRef.current = false
    }
  }

  // 主更新渲染循环 (RAF)
  useEffect(() => {
    if (status !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const update = () => {
      if (isPaused) {
        renderLoopRef.current = requestAnimationFrame(update)
        return
      }

      const engine = engineRef.current
      if (!engine) return

      // 1. 物理引擎步进 (受慢动作控制)
      Matter.Engine.update(engine, 16.66 * slowMo)

      // 2. 更新粒子系统
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx * slowMo
        p.y += p.vy * slowMo
        p.vy += 0.1 * slowMo // 重力微扰
        p.alpha -= p.decay * slowMo
        return p.alpha > 0
      })

      // 3. 更新拖尾记录 (仅针对当前飞行的鸟)
      if (activeBirdBodyRef.current && activeBirdBodyRef.current.speed > 1) {
        const pos = activeBirdBodyRef.current.position
        // 降低拖尾记录密度
        if (Math.random() < 0.3) {
          trailsRef.current.push({ x: pos.x, y: pos.y, alpha: 1.0 })
        }
      }
      trailsRef.current = trailsRef.current.filter((t) => {
        t.alpha -= 0.015 * slowMo
        return t.alpha > 0
      })

      // 4. 清理破损的物块和死亡的猪
      const world = engine.world
      
      blocksRef.current = blocksRef.current.filter((block) => {
        if (block.health <= 0) {
          Matter.Composite.remove(world, block.body)
          // 爆炸碎片
          spawnDebris(block.body.position.x, block.body.position.y, block.material, 12)
          addScore(500)
          return false
        }
        return true
      })

      pigsRef.current = pigsRef.current.filter((pig) => {
        if (pig.health <= 0) {
          Matter.Composite.remove(world, pig.body)
          // 烟雾粒子
          for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = Math.random() * 3 + 1
            particlesRef.current.push({
              x: pig.body.position.x,
              y: pig.body.position.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: '#F3F4F6', // 白色烟雾
              size: Math.random() * 8 + 4,
              alpha: 0.8,
              decay: Math.random() * 0.02 + 0.02
            })
          }
          playSound('explosion')
          triggerCameraShake(8)
          addScore(5000) // 击败猪奖励
          return false
        }
        return true
      })

      // 5. 判断关卡胜负条件
      // 胜利：没有绿猪存活
      if (pigsRef.current.length === 0) {
        if (renderLoopRef.current) cancelAnimationFrame(renderLoopRef.current)
        if (defeatTimerRef.current) {
          clearTimeout(defeatTimerRef.current)
          defeatTimerRef.current = null
        }
        playSound('win')
        // 计算额外未用的小鸟得分
        const bonus = birdsQueueRef.current.length * 10000
        completeLevel(useGameStore.getState().levelScore + bonus)
        return
      }

      // 失败：已没有小鸟可用，且场上所有已经发射的小鸟已经静止/消失
      const activeBirdsMoving = spawnedBirdsRef.current.some(b => {
        // 物体速度大于 0.2 代表还在运动
        return b.body.speed > 0.2
      })

      if (birdsQueueRef.current.length === 0 && !activeBirdBodyRef.current && !activeBirdsMoving) {
        // 如果还没有启动失败定时器，启动它
        if (!defeatTimerRef.current) {
          defeatTimerRef.current = window.setTimeout(() => {
            if (pigsRef.current.length > 0 && useGameStore.getState().status === 'playing') {
              if (renderLoopRef.current) cancelAnimationFrame(renderLoopRef.current)
              playSound('lose')
              failLevel()
            }
            defeatTimerRef.current = null
          }, 2000)
        }
      } else {
        // 如果中途条件不满足，清除定时器
        if (defeatTimerRef.current) {
          clearTimeout(defeatTimerRef.current)
          defeatTimerRef.current = null
        }
      }

      // 6. 自动装载下一只鸟 (如果当前飞行的鸟已经接近静止且未装载新鸟)
      if (activeBirdBodyRef.current && activeBirdBodyRef.current.speed < 0.2 && !isDragging) {
        activeBirdBodyRef.current = null
        const nextQueue = birdsQueueRef.current.slice(1)
        prepareNextBird(nextQueue)
      }

      // 7. 处理相机震动递减
      let offsetX = 0
      let offsetY = 0
      if (cameraShakeRef.current.magnitude > 0.1) {
        const mag = cameraShakeRef.current.magnitude
        offsetX = (Math.random() - 0.5) * mag
        offsetY = (Math.random() - 0.5) * mag
        cameraShakeRef.current.magnitude *= 0.9 // 逐渐减小
      }

      // 8. 绘制画面
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.translate(offsetX, offsetY)

      // 绘制天空背景
      ctx.fillStyle = COLORS.sky
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制远山背景 (装饰)
      ctx.fillStyle = '#bae6fd'
      ctx.beginPath()
      ctx.arc(300, 600, 250, Math.PI, 0)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(750, 600, 300, Math.PI, 0)
      ctx.fill()

      // 绘制地面
      ctx.fillStyle = COLORS.ground
      ctx.fillRect(0, 560, canvas.width, 40)
      ctx.fillStyle = COLORS.groundDark
      ctx.fillRect(0, 560, canvas.width, 4)

      // 绘制弹弓后部支架
      ctx.lineWidth = 14
      ctx.strokeStyle = '#78350F' // 深木色
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(slingCenter.x, slingCenter.y)
      ctx.lineTo(slingCenter.x - 12, 560)
      ctx.stroke()

      // 绘制轨迹拖尾
      trailsRef.current.forEach((pt) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha})`
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      // 绘制所有小鸟 (物理体 + 弹弓上的准备鸟)
      spawnedBirdsRef.current.forEach((b) => {
        drawBird(ctx, b.body.position.x, b.body.position.y, b.body.angle, b.type)
      });

      // 绘制当前正在弹弓上准备发射的小鸟
      if (currentBirdTypeRef.current && !activeBirdBodyRef.current) {
        const bPos = isDragging ? dragPos : slingCenter
        drawBird(ctx, bPos.x, bPos.y, 0, currentBirdTypeRef.current)
      }

      // 绘制弹弓皮筋 (前部) 与发射轨迹预测
      if (isDragging && currentBirdTypeRef.current) {
        // 绘制弹弓的左右两条皮筋
        ctx.lineWidth = 6
        ctx.strokeStyle = '#B45309' // 皮筋拉伸深棕色
        ctx.lineCap = 'round'
        
        // 后皮筋 (先画，在小鸟后面)
        ctx.beginPath()
        ctx.moveTo(slingCenter.x - 16, slingCenter.y - 30)
        ctx.lineTo(dragPos.x, dragPos.y)
        ctx.stroke()

        // 绘制拉伸皮筋前侧 (在小鸟前方)
        ctx.beginPath()
        ctx.moveTo(slingCenter.x + 16, slingCenter.y - 30)
        ctx.lineTo(dragPos.x, dragPos.y)
        ctx.stroke()

        // 绘制预测的飞行轨迹点
        drawTrajectory(ctx)
      }

      // 绘制弹弓前部支架
      ctx.lineWidth = 14
      ctx.strokeStyle = '#92400E'
      ctx.beginPath()
      ctx.moveTo(slingCenter.x, slingCenter.y)
      ctx.lineTo(slingCenter.x + 12, 560)
      ctx.moveTo(slingCenter.x - 16, slingCenter.y - 30)
      ctx.lineTo(slingCenter.x, slingCenter.y)
      ctx.lineTo(slingCenter.x + 16, slingCenter.y - 30)
      ctx.stroke()

      // 绘制建筑结构物块
      blocksRef.current.forEach((block) => {
        drawBlock(ctx, block)
      })

      // 绘制敌人
      pigsRef.current.forEach((pig) => {
        drawPig(ctx, pig)
      })

      // 绘制粒子特效
      particlesRef.current.forEach((p) => {
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1.0 // 重置透明度

      ctx.restore()

      // 同步当前累积分数给 HUD
      setScore(useGameStore.getState().levelScore)

      renderLoopRef.current = requestAnimationFrame(update)
    }

    renderLoopRef.current = requestAnimationFrame(update)
    return () => {
      if (renderLoopRef.current) cancelAnimationFrame(renderLoopRef.current)
    }
  }, [status, isPaused, isDragging, dragPos, currentLevelIndex, slowMo])

  // 绘制小鸟
  const drawBird = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, type: BirdType) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)

    let r = 18
    if (type === 'yellow') r = 16
    else if (type === 'blue') r = 12
    else if (type === 'black') r = 22

    // 绘制小鸟身体主体
    ctx.beginPath()
    if (type === 'yellow') {
      // 黄鸟是三角形
      ctx.moveTo(r * 1.3, 0)
      ctx.lineTo(-r, -r)
      ctx.lineTo(-r, r)
      ctx.closePath()
      ctx.fillStyle = COLORS.yellowBird
      ctx.fill()
    } else {
      // 其它鸟是圆形
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fillStyle = type === 'red' ? COLORS.redBird : type === 'blue' ? COLORS.blueBird : COLORS.blackBird
      ctx.fill()
    }

    // 绘制肚皮 (白底腹部)
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    if (type === 'yellow') {
      ctx.moveTo(r * 0.4, r * 0.4)
      ctx.lineTo(-r, r)
      ctx.lineTo(-r, r * 0.2)
      ctx.closePath()
      ctx.fill()
    } else {
      ctx.arc(0, r * 0.3, r * 0.7, 0.2, Math.PI - 0.2)
      ctx.fill()
    }

    // 黑鸟顶部发光羽毛
    if (type === 'black') {
      ctx.fillStyle = COLORS.beak
      ctx.fillRect(-4, -r - 10, 8, 10)
      ctx.fillStyle = '#FFF'
      ctx.beginPath()
      ctx.arc(0, -r - 10, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    // 绘制愤怒的眉毛与眼睛
    ctx.fillStyle = '#FFF' // 眼白
    ctx.beginPath()
    ctx.arc(r * 0.3, -r * 0.2, 5, 0, Math.PI * 2)
    ctx.arc(r * 0.7, -r * 0.2, 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#000' // 瞳孔
    ctx.beginPath()
    ctx.arc(r * 0.4, -r * 0.2, 2.5, 0, Math.PI * 2)
    ctx.arc(r * 0.75, -r * 0.2, 2.5, 0, Math.PI * 2)
    ctx.fill()

    // 绘制黑色愤怒粗眉毛
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(r * 0.1, -r * 0.45)
    ctx.lineTo(r * 0.85, -r * 0.35)
    ctx.moveTo(r * 0.9, -r * 0.45)
    ctx.lineTo(r * 0.25, -r * 0.35)
    ctx.stroke()

    // 绘制尖尖的鸟嘴巴
    ctx.fillStyle = COLORS.beak
    ctx.beginPath()
    ctx.moveTo(r * 0.6, -r * 0.05)
    ctx.lineTo(r * 1.2, r * 0.1)
    ctx.lineTo(r * 0.5, r * 0.25)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  // 绘制猪
  const drawPig = (ctx: CanvasRenderingContext2D, pig: { body: Matter.Body; maxHealth: number; health: number }) => {
    const { x, y } = pig.body.position
    const r = (pig.body as any).circleRadius || 18
    const damageRatio = pig.health / pig.maxHealth

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(pig.body.angle)

    // 身体外轮廓
    ctx.fillStyle = COLORS.pig
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    // 猪耳朵
    ctx.fillStyle = COLORS.pigDark
    ctx.beginPath()
    ctx.arc(-r * 0.6, -r * 0.8, r * 0.35, 0, Math.PI * 2)
    ctx.arc(r * 0.6, -r * 0.8, r * 0.35, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#F87171' // 耳朵内红
    ctx.beginPath()
    ctx.arc(-r * 0.6, -r * 0.8, r * 0.15, 0, Math.PI * 2)
    ctx.arc(r * 0.6, -r * 0.8, r * 0.15, 0, Math.PI * 2)
    ctx.fill()

    // 猪大鼻子
    ctx.fillStyle = COLORS.pigFace
    ctx.beginPath()
    ctx.ellipse(0, r * 0.1, r * 0.5, r * 0.35, 0, 0, Math.PI * 2)
    ctx.fill()
    // 两个小鼻孔
    ctx.fillStyle = COLORS.pigDark
    ctx.beginPath()
    ctx.arc(-r * 0.15, r * 0.1, 2, 0, Math.PI * 2)
    ctx.arc(r * 0.15, r * 0.1, 2, 0, Math.PI * 2)
    ctx.fill()

    // 猪白溜溜的大眼睛
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.arc(-r * 0.4, -r * 0.25, 4.5, 0, Math.PI * 2)
    ctx.arc(r * 0.4, -r * 0.25, 4.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(-r * 0.35, -r * 0.25, 2, 0, Math.PI * 2)
    ctx.arc(r * 0.35, -r * 0.25, 2, 0, Math.PI * 2)
    ctx.fill()

    // 如果受伤绘制痛苦表情/创可贴
    if (damageRatio < 0.7) {
      // 痛苦细眉毛
      ctx.strokeStyle = COLORS.pigDark
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(-r * 0.6, -r * 0.45)
      ctx.lineTo(-r * 0.2, -r * 0.4)
      ctx.moveTo(r * 0.6, -r * 0.45)
      ctx.lineTo(r * 0.2, -r * 0.4)
      ctx.stroke()
    }
    if (damageRatio < 0.4) {
      // 脸颊贴着创可贴 (X 形线)
      ctx.strokeStyle = '#FBBF24'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-r * 0.7, r * 0.2)
      ctx.lineTo(-r * 0.3, r * 0.6)
      ctx.moveTo(-r * 0.3, r * 0.2)
      ctx.lineTo(-r * 0.7, r * 0.6)
      ctx.stroke()
    }

    ctx.restore()
  }

  // 绘制方块
  const drawBlock = (ctx: CanvasRenderingContext2D, block: { body: Matter.Body; material: BlockMaterial; maxHealth: number; health: number }) => {
    const { x, y } = block.body.position
    const vertices = block.body.vertices
    const damageRatio = block.health / block.maxHealth

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(vertices[0].x, vertices[0].y)
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y)
    }
    ctx.closePath()

    // 根据材质填充颜色
    let baseColor = COLORS.wood
    let strokeColor = '#78350F'
    if (block.material === 'stone') {
      baseColor = COLORS.stone
      strokeColor = '#374151'
    } else if (block.material === 'glass') {
      baseColor = COLORS.glass
      strokeColor = '#2563EB'
      ctx.globalAlpha = 0.75
    }

    ctx.fillStyle = baseColor
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = strokeColor
    ctx.stroke()

    // 绘制木纹或者反光线条
    if (block.material === 'glass') {
      ctx.strokeStyle = COLORS.glassLight
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(vertices[0].x + 3, vertices[0].y + 3)
      ctx.lineTo(vertices[2].x - 3, vertices[2].y - 3)
      ctx.stroke()
    } else if (block.material === 'wood') {
      ctx.strokeStyle = COLORS.woodLight
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo((vertices[0].x + vertices[1].x) / 2, (vertices[0].y + vertices[1].y) / 2)
      ctx.lineTo((vertices[2].x + vertices[3].x) / 2, (vertices[2].y + vertices[3].y) / 2)
      ctx.stroke()
    }

    // 绘制裂纹 (体现受损)
    if (damageRatio < 0.75) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      // 从中心点画几条发散的断续裂缝
      ctx.moveTo(x, y)
      ctx.lineTo(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20)
      ctx.moveTo(x, y)
      ctx.lineTo(x + (Math.random() - 0.5) * 15, y + (Math.random() - 0.5) * 15)
      ctx.stroke()
    }
    if (damageRatio < 0.4) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x - 10, y - 5)
      ctx.lineTo(x + 10, y + 10)
      ctx.moveTo(x + 5, y - 10)
      ctx.lineTo(x - 8, y + 8)
      ctx.stroke()
    }

    ctx.restore()
    ctx.globalAlpha = 1.0 // 重置透明度
  }

  // 绘制发射轨迹预测线
  const drawTrajectory = (ctx: CanvasRenderingContext2D) => {
    // 根据拉伸向量计算初始速度
    const forceX = slingCenter.x - dragPos.x
    const forceY = slingCenter.y - dragPos.y
    
    // 弹射力乘数
    const velocityMultiplier = 0.28
    const vx = forceX * velocityMultiplier
    const vy = forceY * velocityMultiplier

    let x = dragPos.x
    let y = dragPos.y
    let curVx = vx
    let curVy = vy
    const gravity = 0.35 // 重力影响

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    // 模拟 30 个时间步长
    for (let step = 0; step < 30; step++) {
      // 物理步长微积分
      x += curVx
      y += curVy
      curVy += gravity

      // 仅在地面上方画点
      if (y > 560) break

      ctx.beginPath()
      // 点的粗细逐渐变细
      ctx.arc(x, y, Math.max(1, 4 - step * 0.1), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 拖拽弹弓交互处理
  const handleStartDrag = (clientX: number, clientY: number) => {
    if (status !== 'playing' || activeBirdBodyRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    // 检查点击位置是否在弹弓中心方圆 60 像素内
    const dist = Math.hypot(x - slingCenter.x, y - slingCenter.y)
    if (dist < 60 && currentBirdTypeRef.current) {
      setIsDragging(true)
      setDragPos({ x, y })
    }
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    // 计算到弹弓中心的距离并限制最大拉伸
    const dx = x - slingCenter.x
    const dy = y - slingCenter.y
    const dist = Math.hypot(dx, dy)

    if (dist > slingMaxStretch) {
      const angle = Math.atan2(dy, dx)
      setDragPos({
        x: slingCenter.x + Math.cos(angle) * slingMaxStretch,
        y: slingCenter.y + Math.sin(angle) * slingMaxStretch
      })
    } else {
      setDragPos({ x, y })
    }
  }

  const handleReleaseDrag = () => {
    if (!isDragging || !currentBirdTypeRef.current) return
    setIsDragging(false)

    // 创建 Matter 小鸟实体并发射
    const engine = engineRef.current
    if (!engine) return

    const forceX = slingCenter.x - dragPos.x
    const forceY = slingCenter.y - dragPos.y

    // 初始速度系数
    const speedFactor = 0.28
    const vx = forceX * speedFactor
    const vy = forceY * speedFactor

    let r = 18
    let density = 0.003
    if (currentBirdTypeRef.current === 'yellow') {
      r = 16
      density = 0.0025
    } else if (currentBirdTypeRef.current === 'blue') {
      r = 12
      density = 0.002
    } else if (currentBirdTypeRef.current === 'black') {
      r = 22
      density = 0.005
    }

    const birdBody = Matter.Bodies.circle(dragPos.x, dragPos.y, r, {
      density,
      friction: 0.2,
      restitution: 0.5,
      label: 'bird'
    })

    // 应用弹射初速度
    Matter.Body.setVelocity(birdBody, { x: vx, y: vy })

    // 添加到物理世界中
    Matter.Composite.add(engine.world, birdBody)
    
    // 登记为活动鸟
    activeBirdBodyRef.current = birdBody
    spawnedBirdsRef.current.push({
      body: birdBody,
      type: currentBirdTypeRef.current,
      hasUsedAbility: false
    })

    // 消耗当前鸟
    useBird()
    playSound('launch')

    // 物理世界稳定后再启用技能激活
    setTimeout(() => {
      canTriggerAbilityRef.current = true
    }, 100)
  }

  // 监听空格或点击触发飞行小鸟的特殊技能
  const triggerSpecialAbility = () => {
    if (!canTriggerAbilityRef.current) return

    const activeBirdObj = spawnedBirdsRef.current.find(b => b.body === activeBirdBodyRef.current)
    if (!activeBirdObj || activeBirdObj.hasUsedAbility) return

    const body = activeBirdObj.body
    const type = activeBirdObj.type
    const engine = engineRef.current
    if (!engine) return

    activeBirdObj.hasUsedAbility = true
    playSound('launch') // 触发爆发声

    if (type === 'yellow') {
      // 1. 黄鸟加速：突进，速度翻倍
      const velocity = body.velocity
      const speed = Matter.Vector.magnitude(velocity)
      const unit = Matter.Vector.normalise(velocity)
      
      Matter.Body.setVelocity(body, {
        x: unit.x * Math.max(speed * 2, 20),
        y: unit.y * Math.max(speed * 2, 20)
      })

      // 产生加速火花粒子
      for (let i = 0; i < 15; i++) {
        particlesRef.current.push({
          x: body.position.x,
          y: body.position.y,
          vx: -unit.x * (Math.random() * 5 + 2) + (Math.random() - 0.5) * 2,
          vy: -unit.y * (Math.random() * 5 + 2) + (Math.random() - 0.5) * 2,
          color: COLORS.yellowBird,
          size: Math.random() * 4 + 2,
          alpha: 1.0,
          decay: 0.04
        })
      }
      triggerCameraShake(4)

    } else if (type === 'blue') {
      // 2. 蓝鸟分裂：分成 3 只
      const velocity = body.velocity
      const pos = body.position
      const speed = Matter.Vector.magnitude(velocity)
      const baseAngle = Math.atan2(velocity.y, velocity.x)

      // 另外两个分裂的鸟的偏转角
      const spreadAngle = 0.15 
      const angles = [baseAngle - spreadAngle, baseAngle + spreadAngle]

      angles.forEach((angle) => {
        const vx = Math.cos(angle) * speed
        const vy = Math.sin(angle) * speed

        const splitBody = Matter.Bodies.circle(pos.x, pos.y, 12, {
          density: 0.002,
          friction: 0.2,
          restitution: 0.5,
          label: 'bird'
        })
        Matter.Body.setVelocity(splitBody, { x: vx, y: vy })
        Matter.Composite.add(engine.world, splitBody)

        spawnedBirdsRef.current.push({
          body: splitBody,
          type: 'blue',
          hasUsedAbility: true
        })
      })

      // 蓝白分裂水花粒子
      for (let i = 0; i < 12; i++) {
        particlesRef.current.push({
          x: pos.x,
          y: pos.y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          color: COLORS.glassLight,
          size: Math.random() * 3 + 1,
          alpha: 0.9,
          decay: 0.05
        })
      }

    } else if (type === 'black') {
      // 3. 黑鸟爆炸：对周围结构物和绿猪施加巨大的爆炸力和爆破伤害
      const pos = body.position
      const radius = 140
      const forceMagnitude = 0.25

      // 闪烁爆破红白强光特效
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * radius
        particlesRef.current.push({
          x: pos.x + Math.cos(angle) * dist,
          y: pos.y + Math.sin(angle) * dist,
          vx: Math.cos(angle) * (Math.random() * 8 + 4),
          vy: Math.sin(angle) * (Math.random() * 8 + 4),
          color: Math.random() < 0.6 ? '#EF4444' : '#F59E0B',
          size: Math.random() * 12 + 6,
          alpha: 1.0,
          decay: Math.random() * 0.04 + 0.02
        })
      }

      // 获取当前场景中所有的刚体，计算到爆炸中心的距离并施加力
      const allBodies = Matter.Composite.allBodies(engine.world)
      allBodies.forEach((targetBody) => {
        if (targetBody.isStatic || targetBody === body) return

        const targetPos = targetBody.position
        const dx = targetPos.x - pos.x
        const dy = targetPos.y - pos.y
        const dist = Math.hypot(dx, dy)

        if (dist < radius) {
          // 力大小和距离反比
          const factor = (radius - dist) / radius
          const angle = Math.atan2(dy, dx)
          const force = Matter.Vector.create(
            Math.cos(angle) * forceMagnitude * factor * targetBody.mass,
            Math.sin(angle) * forceMagnitude * factor * targetBody.mass
          )
          
          Matter.Body.applyForce(targetBody, targetPos, force)

          // 物理伤害增加
          const damage = Math.round(factor * 120)
          
          const block = blocksRef.current.find(b => b.body === targetBody)
          if (block) block.health -= damage

          const pig = pigsRef.current.find(p => p.body === targetBody)
          if (pig) pig.health -= damage
        }
      })

      // 慢动作与相机震动效果
      triggerCameraShake(15)
      triggerSlowMotion(1200)
      playSound('explosion')

      // 在物理引擎中移除黑鸟自身
      Matter.Composite.remove(engine.world, body)
      spawnedBirdsRef.current = spawnedBirdsRef.current.filter(b => b.body !== body)
      activeBirdBodyRef.current = null
    }
  }

  // 鼠标 / 触屏事件处理器封装
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleStartDrag(e.clientX, e.clientY)
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleDragMove(e.clientX, e.clientY)
  }

  const onMouseUp = () => {
    handleReleaseDrag()
  }

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      handleStartDrag(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  // 双击或点击画板可以触发技能，也可以响应键盘空格键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        triggerSpecialAbility()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="relative flex flex-col items-center select-none bg-sky-900/10 rounded-2xl p-4 border border-white/20 shadow-2xl backdrop-blur-sm overflow-hidden">
      {/* 画面状态与 HUD 面板 */}
      <div className="w-full max-w-[1000px] flex justify-between items-center mb-3 text-white">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-indigo-200">{level.name}</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
            关卡 {currentLevelIndex + 1}
          </span>
        </div>
        
        {/* 小鸟余量显示 */}
        <div className="flex items-center gap-2">
          {birdsLeft.map((b, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full border border-white/30 transition-transform hover:scale-110 ${
                b === 'red' ? 'bg-red-500' : b === 'yellow' ? 'bg-yellow-500' : b === 'blue' ? 'bg-blue-500' : 'bg-gray-800'
              }`}
              title={b + ' bird'}
            />
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-gray-300">SCORE</div>
            <div className="text-2xl font-black text-yellow-400 font-mono tracking-wider">{score}</div>
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-1.5 rounded-lg font-bold bg-white/15 border border-white/10 hover:bg-white/30 transition"
          >
            {isPaused ? '继续' : '暂停'}
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onMouseUp}
          onClick={triggerSpecialAbility}
          className="bg-sky-100 border border-white/30 rounded-xl cursor-crosshair max-w-full aspect-[1.66]"
        />

        {/* 飞行中技能点击提示 */}
        {canTriggerAbilityRef.current && spawnedBirdsRef.current.find(b => b.body === activeBirdBodyRef.current && !b.hasUsedAbility) && (
          <div className="absolute left-1/2 bottom-8 -translate-x-1/2 bg-black/60 backdrop-blur text-yellow-300 text-xs px-4 py-2 rounded-full font-bold animate-bounce pointer-events-none">
            点击画面或按 [空格键] 释放特殊能力！
          </div>
        )}
      </div>
    </div>
  )
}
