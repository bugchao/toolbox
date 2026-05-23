import { useGameStore } from '../state/gameStore'

let audioCtx: AudioContext | null = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// 播放正弦波/三角波合成的声音
export function playSound(type: 'launch' | 'wood_hit' | 'stone_hit' | 'glass_break' | 'pig_hit' | 'explosion' | 'win' | 'lose') {
  if (!useGameStore.getState().soundEnabled) return

  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    switch (type) {
      case 'launch': {
        // 弹弓拉伸发射：whoosh 上扬音频
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(150, now)
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15)

        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.18)
        break
      }
      case 'wood_hit': {
        // 木头碰撞：沉闷的低频冲击
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(120, now)
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1)

        gain.gain.setValueAtTime(0.4, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.12)
        break
      }
      case 'stone_hit': {
        // 石头碰撞：比木头更沉重、频率更低
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(90, now)
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15)

        gain.gain.setValueAtTime(0.5, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.16)
        break
      }
      case 'glass_break': {
        // 玻璃碎裂：清脆的高频叮咚声，连击
        for (let i = 0; i < 3; i++) {
          const t = now + i * 0.03
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(1200 + Math.random() * 800, t)
          osc.frequency.exponentialRampToValueAtTime(800, t + 0.08)

          gain.gain.setValueAtTime(0.15, t)
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08)

          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.start(t)
          osc.stop(t + 0.08)
        }
        break
      }
      case 'pig_hit': {
        // 猪受击：滑稽的哼哼声
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(300, now)
        osc.frequency.linearRampToValueAtTime(180, now + 0.08)
        osc.frequency.linearRampToValueAtTime(250, now + 0.15)

        gain.gain.setValueAtTime(0.2, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18)

        // 带个低通滤波器，使其听起来更像猪叫
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(600, now)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.18)
        break
      }
      case 'explosion': {
        // 爆炸：低频白噪声轰鸣
        // 创建噪音缓冲区
        const bufferSize = ctx.sampleRate * 0.4
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1
        }

        const noise = ctx.createBufferSource()
        noise.buffer = buffer

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(800, now)
        filter.frequency.exponentialRampToValueAtTime(10, now + 0.4)

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.6, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)

        noise.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        noise.start(now)
        noise.stop(now + 0.4)

        // 辅以一个正弦低频冲击
        const subOsc = ctx.createOscillator()
        const subGain = ctx.createGain()
        subOsc.frequency.setValueAtTime(120, now)
        subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.3)
        subGain.gain.setValueAtTime(0.8, now)
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

        subOsc.connect(subGain)
        subGain.connect(ctx.destination)
        subOsc.start(now)
        subOsc.stop(now + 0.3)
        break
      }
      case 'win': {
        // 关卡胜利：琶音大调音阶
        const notes = [261.63, 329.63, 392.00, 523.25] // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.1
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, t)
          
          gain.gain.setValueAtTime(0.15, t)
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3)

          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(t)
          osc.stop(t + 0.3)
        })
        break
      }
      case 'lose': {
        // 关卡失败：哀伤的下行降音
        const notes = [392.00, 349.23, 311.13, 233.08] // G4, F4, Eb4, Bb3
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.15
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, t)
          
          gain.gain.setValueAtTime(0.15, t)
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4)

          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(t)
          osc.stop(t + 0.4)
        })
        break
      }
    }
  } catch (error) {
    console.warn('Web Audio Playback failed:', error)
  }
}
