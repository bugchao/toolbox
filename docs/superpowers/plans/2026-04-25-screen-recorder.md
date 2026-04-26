# Screen Recorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-native screen recorder tool (`/screen-recorder`) that captures screen/window/tab with optional system audio + microphone, outputs a local WebM file, and makes zero network requests.

**Architecture:** Pure client-side React component using `getDisplayMedia` + `MediaRecorder` + Web Audio API for mixing. State machine (`idle | requesting | recording | paused | finished | error`) drives UI panel switching. No backend, no third-party recording libs.

**Tech Stack:** React 18, TypeScript, Web APIs (`MediaDevices.getDisplayMedia`, `MediaRecorder`, `AudioContext`), `@toolbox/ui-kit`, `lucide-react`, `react-i18next`

---

## File Structure

**New files:**
- `tools/tool-screen-recorder/package.json` — workspace package manifest
- `tools/tool-screen-recorder/tool.manifest.ts` — tool registry entry
- `tools/tool-screen-recorder/src/index.tsx` — re-export
- `tools/tool-screen-recorder/src/ScreenRecorder.tsx` — main component
- `tools/tool-screen-recorder/src/hooks/useScreenRecorder.ts` — state machine + recording logic
- `tools/tool-screen-recorder/src/lib/formatDuration.ts` — HH:MM:SS formatter
- `tools/tool-screen-recorder/src/lib/formatDuration.test.ts` — unit test
- `tools/tool-screen-recorder/src/lib/getMimeTypes.ts` — enumerate supported MIME types
- `tools/tool-screen-recorder/src/locales/zh.json` — Chinese i18n
- `tools/tool-screen-recorder/src/locales/en.json` — English i18n
- `tools/tool-screen-recorder/src/components/IdlePanel.tsx` — pre-recording UI
- `tools/tool-screen-recorder/src/components/RecordingPanel.tsx` — active recording UI
- `tools/tool-screen-recorder/src/components/FinishedPanel.tsx` — post-recording preview
- `tools/tool-screen-recorder/src/components/ErrorPanel.tsx` — error states
- `packages/ui-kit/src/Switch.tsx` — toggle primitive (if missing)
- `tests/screen-recorder.spec.ts` — Playwright e2e smoke test

**Modified files:**
- `packages/ui-kit/src/index.ts` — export `Switch` if added
- `docs/tools/screen-recorder/PRD.md` — already exists
- `openspec/changes/add-screen-recorder-tool/` — already exists

---

## Task 1: Scaffold Tool Package

**Files:**
- Create: `tools/tool-screen-recorder/` (entire directory)

- [ ] **Step 1: Run scaffold command**

```bash
cd /Users/dyck/workspaces/ai/toolbox-codex
pnpm create:tool screen-recorder
```

Expected output: `✓ Created: tools/tool-screen-recorder/`

- [ ] **Step 2: Install workspace dependencies**

```bash
pnpm install
```

Expected: `pnpm` links the new `@toolbox/tool-screen-recorder` package

- [ ] **Step 3: Verify scaffold structure**

```bash
ls tools/tool-screen-recorder/
```

Expected output includes: `package.json`, `tool.manifest.ts`, `src/`

- [ ] **Step 4: Commit scaffold**

```bash
git add tools/tool-screen-recorder/
git commit -m "chore(tool-screen-recorder): scaffold package"
```

---

## Task 2: Configure Manifest

**Files:**
- Modify: `tools/tool-screen-recorder/tool.manifest.ts`

- [ ] **Step 1: Write complete manifest**

```typescript
import { defineToolManifest } from '@toolbox/tool-registry'
import { Video } from 'lucide-react'

const toolScreenRecorderManifest = defineToolManifest({
  id: 'tool-screen-recorder',
  path: '/screen-recorder',
  namespace: 'toolScreenRecorder',
  mode: 'client',
  categoryKey: 'utility',
  icon: Video,
  keywords: [
    'screen recorder',
    'screen capture',
    'record screen',
    'webm',
    'mediarecorder',
    'getDisplayMedia',
    '屏幕录制',
    '录屏',
    '本地录屏',
    '隐私',
    '无上传',
  ],
  meta: {
    zh: {
      title: '屏幕录制 Studio',
      description: '浏览器内录制屏幕/窗口/标签，支持系统音+麦克风，完全本地无上传',
    },
    en: {
      title: 'Screen Recorder Studio',
      description: 'Record screen/window/tab in-browser with system audio + mic, fully local with zero uploads',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolScreenRecorderManifest
```

- [ ] **Step 2: Commit manifest**

```bash
git add tools/tool-screen-recorder/tool.manifest.ts
git commit -m "feat(tool-screen-recorder): configure manifest with Video icon and utility category"
```


---

## Task 3: Add Switch Primitive to ui-kit (if missing)

**Files:**
- Create: `packages/ui-kit/src/Switch.tsx`
- Modify: `packages/ui-kit/src/index.ts`

- [ ] **Step 1: Check if Switch exists**

```bash
grep -q "Switch" packages/ui-kit/src/index.ts && echo "EXISTS" || echo "MISSING"
```

If EXISTS, skip to Task 4. Otherwise continue.

- [ ] **Step 2: Write Switch component**

```typescript
// packages/ui-kit/src/Switch.tsx
import React from 'react'
import { cn } from './lib/cn'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled, className }) => {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {label && <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>}
    </label>
  )
}

export default Switch
```

- [ ] **Step 3: Export Switch from ui-kit**

Add to `packages/ui-kit/src/index.ts`:

```typescript
export { default as Switch } from './Switch'
export type { SwitchProps } from './Switch'
```

- [ ] **Step 4: Commit Switch**

```bash
git add packages/ui-kit/src/Switch.tsx packages/ui-kit/src/index.ts
git commit -m "feat(ui-kit): add Switch toggle component"
```


---

## Task 4: Write Duration Formatter (TDD)

**Files:**
- Create: `tools/tool-screen-recorder/src/lib/formatDuration.ts`
- Create: `tools/tool-screen-recorder/src/lib/formatDuration.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tools/tool-screen-recorder/src/lib/formatDuration.test.ts
import { describe, it, expect } from 'vitest'
import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('formats zero seconds', () => {
    expect(formatDuration(0)).toBe('00:00:00')
  })

  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('00:00:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('00:02:05')
  })

  it('formats hours, minutes, and seconds', () => {
    expect(formatDuration(3665)).toBe('01:01:05')
  })

  it('pads single digits', () => {
    expect(formatDuration(3661)).toBe('01:01:01')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tools/tool-screen-recorder/src/lib/formatDuration.test.ts
```

Expected: FAIL with "Cannot find module './formatDuration'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// tools/tool-screen-recorder/src/lib/formatDuration.ts
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tools/tool-screen-recorder/src/lib/formatDuration.test.ts
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add tools/tool-screen-recorder/src/lib/
git commit -m "feat(tool-screen-recorder): add formatDuration utility with tests"
```


---

## Task 5: Write MIME Type Enumerator

**Files:**
- Create: `tools/tool-screen-recorder/src/lib/getMimeTypes.ts`

- [ ] **Step 1: Write MIME enumerator**

```typescript
// tools/tool-screen-recorder/src/lib/getMimeTypes.ts
const CANDIDATE_MIMES = [
  'video/webm; codecs=vp9',
  'video/webm; codecs=vp8',
  'video/webm',
  'video/mp4',
]

export function getSupportedMimeTypes(): string[] {
  if (!window.MediaRecorder) return []
  return CANDIDATE_MIMES.filter(mime => MediaRecorder.isTypeSupported(mime))
}

export function getDefaultMimeType(): string | null {
  const supported = getSupportedMimeTypes()
  return supported[0] || null
}

export function getExtensionForMime(mime: string): string {
  if (mime.startsWith('video/webm')) return 'webm'
  if (mime.startsWith('video/mp4')) return 'mp4'
  return 'video'
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/tool-screen-recorder/src/lib/getMimeTypes.ts
git commit -m "feat(tool-screen-recorder): add MIME type enumeration utilities"
```

---

## Task 6: Write State Machine Hook (Core Logic)

**Files:**
- Create: `tools/tool-screen-recorder/src/hooks/useScreenRecorder.ts`

- [ ] **Step 1: Define state types**

```typescript
// tools/tool-screen-recorder/src/hooks/useScreenRecorder.ts
import { useState, useRef, useCallback, useEffect } from 'react'

export type RecorderState = 
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'paused'
  | 'finished'
  | 'error'

export type ErrorType = 
  | 'unsupported'
  | 'permissionDenied'
  | 'deviceError'
  | 'recordingFailed'

export interface RecorderOptions {
  includeSystemAudio: boolean
  includeMic: boolean
  mimeType: string
}

export interface RecorderData {
  state: RecorderState
  errorType: ErrorType | null
  elapsedSeconds: number
  estimatedSizeBytes: number
  videoUrl: string | null
  finalSizeBytes: number
  finalDurationSeconds: number
}
```


- [ ] **Step 2: Write hook skeleton with start logic**

```typescript
export function useScreenRecorder() {
  const [state, setState] = useState<RecorderState>('idle')
  const [errorType, setErrorType] = useState<ErrorType | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [estimatedSizeBytes, setEstimatedSizeBytes] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [finalSizeBytes, setFinalSizeBytes] = useState(0)
  const [finalDurationSeconds, setFinalDurationSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(async (options: RecorderOptions) => {
    setState('requesting')
    chunksRef.current = []
    setEstimatedSizeBytes(0)
    setElapsedSeconds(0)

    try {
      // Get display media
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: options.includeSystemAudio,
      })

      let finalStream = displayStream

      // Mix audio if both system and mic are requested
      if (options.includeSystemAudio && options.includeMic) {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioContext = new AudioContext()
        const destination = audioContext.createMediaStreamDestination()
        
        const systemSource = audioContext.createMediaStreamSource(displayStream)
        const micSource = audioContext.createMediaStreamSource(micStream)
        
        systemSource.connect(destination)
        micSource.connect(destination)

        const videoTrack = displayStream.getVideoTracks()[0]
        const mixedAudioTrack = destination.stream.getAudioTracks()[0]
        finalStream = new MediaStream([videoTrack, mixedAudioTrack])

        audioContextRef.current = audioContext
      } else if (!options.includeSystemAudio && options.includeMic) {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const videoTrack = displayStream.getVideoTracks()[0]
        const micTrack = micStream.getAudioTracks()[0]
        finalStream = new MediaStream([videoTrack, micTrack])
      }

      streamRef.current = finalStream

      const recorder = new MediaRecorder(finalStream, { mimeType: options.mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
          setEstimatedSizeBytes(prev => prev + e.data.size)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType })
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        setFinalSizeBytes(blob.size)
        setFinalDurationSeconds(elapsedSeconds)
        setState('finished')
        cleanup()
      }

      recorder.start(1000) // 1s timeslice
      setState('recording')
      startTimeRef.current = Date.now()
      pausedTimeRef.current = 0

      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000)
        setElapsedSeconds(elapsed)
      }, 1000)

    } catch (err: any) {
      cleanup()
      if (err.name === 'NotAllowedError') {
        setErrorType('permissionDenied')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorType('deviceError')
      } else {
        setErrorType('recordingFailed')
      }
      setState('error')
    }
  }, [cleanup, elapsedSeconds])

  return {
    state,
    errorType,
    elapsedSeconds,
    estimatedSizeBytes,
    videoUrl,
    finalSizeBytes,
    finalDurationSeconds,
    startRecording,
    cleanup,
  }
}
```


- [ ] **Step 3: Add pause/resume/stop controls**

Add these methods inside `useScreenRecorder` before the return statement:

```typescript
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause()
      setState('paused')
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      pausedTimeRef.current = Date.now() - startTimeRef.current - pausedTimeRef.current
    }
  }, [state])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume()
      setState('recording')
      startTimeRef.current = Date.now() - pausedTimeRef.current
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsedSeconds(elapsed)
      }, 1000)
    }
  }, [state])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && (state === 'recording' || state === 'paused')) {
      mediaRecorderRef.current.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state])

  const reset = useCallback(() => {
    cleanup()
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setState('idle')
    setErrorType(null)
    setElapsedSeconds(0)
    setEstimatedSizeBytes(0)
    setVideoUrl(null)
    setFinalSizeBytes(0)
    setFinalDurationSeconds(0)
    chunksRef.current = []
  }, [cleanup, videoUrl])
```

Update the return statement:

```typescript
  return {
    state,
    errorType,
    elapsedSeconds,
    estimatedSizeBytes,
    videoUrl,
    finalSizeBytes,
    finalDurationSeconds,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  }
}
```

- [ ] **Step 4: Add cleanup on unmount**

Add this effect before the return:

```typescript
  useEffect(() => {
    return () => {
      cleanup()
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [cleanup, videoUrl])
```

- [ ] **Step 5: Commit hook**

```bash
git add tools/tool-screen-recorder/src/hooks/useScreenRecorder.ts
git commit -m "feat(tool-screen-recorder): implement state machine hook with recording lifecycle"
```


---

## Task 7: Write i18n Locales

**Files:**
- Create: `tools/tool-screen-recorder/src/locales/zh.json`
- Create: `tools/tool-screen-recorder/src/locales/en.json`

- [ ] **Step 1: Write Chinese locale**

```json
{
  "title": "屏幕录制 Studio",
  "description": "浏览器内录制屏幕/窗口/标签，支持系统音+麦克风，完全本地无上传",
  "idle": {
    "title": "录制选项",
    "includeSystemAudio": "包含系统音",
    "includeMic": "包含麦克风",
    "mimeType": "输出格式",
    "startButton": "开始录制",
    "hint": "浏览器会弹出选择器，选择要录制的源"
  },
  "recording": {
    "statusRecording": "录制中",
    "statusPaused": "已暂停",
    "sizeLabel": "大小",
    "sizeWarning": "录制文件已超过 1 GB",
    "pauseButton": "暂停",
    "resumeButton": "继续",
    "stopButton": "停止"
  },
  "finished": {
    "previewLabel": "预览",
    "durationLabel": "时长",
    "sizeLabel": "大小",
    "downloadButton": "下载",
    "restartButton": "再录一段"
  },
  "error": {
    "unsupported": "您的浏览器不支持屏幕录制功能",
    "permissionDenied": "您拒绝了屏幕共享授权，请重试并允许访问",
    "deviceError": "未找到可用的录制设备",
    "recordingFailed": "录制过程中发生错误",
    "retryButton": "重试",
    "backButton": "返回"
  }
}
```

- [ ] **Step 2: Write English locale**

```json
{
  "title": "Screen Recorder Studio",
  "description": "Record screen/window/tab in-browser with system audio + mic, fully local with zero uploads",
  "idle": {
    "title": "Recording Options",
    "includeSystemAudio": "Include system audio",
    "includeMic": "Include microphone",
    "mimeType": "Output format",
    "startButton": "Start Recording",
    "hint": "Browser will show a picker to select the source"
  },
  "recording": {
    "statusRecording": "Recording",
    "statusPaused": "Paused",
    "sizeLabel": "Size",
    "sizeWarning": "Recording exceeds 1 GB",
    "pauseButton": "Pause",
    "resumeButton": "Resume",
    "stopButton": "Stop"
  },
  "finished": {
    "previewLabel": "Preview",
    "durationLabel": "Duration",
    "sizeLabel": "Size",
    "downloadButton": "Download",
    "restartButton": "Record Again"
  },
  "error": {
    "unsupported": "Your browser does not support screen recording",
    "permissionDenied": "Screen share permission denied. Please retry and allow access.",
    "deviceError": "No recording device found",
    "recordingFailed": "An error occurred during recording",
    "retryButton": "Retry",
    "backButton": "Back"
  }
}
```

- [ ] **Step 3: Commit locales**

```bash
git add tools/tool-screen-recorder/src/locales/
git commit -m "feat(tool-screen-recorder): add zh and en i18n locales"
```


---

## Task 8: Build IdlePanel Component

**Files:**
- Create: `tools/tool-screen-recorder/src/components/IdlePanel.tsx`

- [ ] **Step 1: Write IdlePanel**

```typescript
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Button, Switch } from '@toolbox/ui-kit'
import { getSupportedMimeTypes, getDefaultMimeType } from '../lib/getMimeTypes'

interface IdlePanelProps {
  onStart: (options: { includeSystemAudio: boolean; includeMic: boolean; mimeType: string }) => void
}

const IdlePanel: React.FC<IdlePanelProps> = ({ onStart }) => {
  const { t } = useTranslation('toolScreenRecorder')
  const [includeSystemAudio, setIncludeSystemAudio] = useState(false)
  const [includeMic, setIncludeMic] = useState(false)
  const [mimeType, setMimeType] = useState(getDefaultMimeType() || '')

  const supportedMimes = getSupportedMimeTypes()

  return (
    <Card className="max-w-md mx-auto p-6">
      <h3 className="text-lg font-semibold mb-4">{t('idle.title')}</h3>
      <div className="space-y-4">
        <Switch
          checked={includeSystemAudio}
          onChange={setIncludeSystemAudio}
          label={t('idle.includeSystemAudio')}
        />
        <Switch
          checked={includeMic}
          onChange={setIncludeMic}
          label={t('idle.includeMic')}
        />
        <div>
          <label className="block text-sm font-medium mb-2">{t('idle.mimeType')}</label>
          <select
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          >
            {supportedMimes.map(mime => (
              <option key={mime} value={mime}>{mime}</option>
            ))}
          </select>
        </div>
        <Button
          onClick={() => onStart({ includeSystemAudio, includeMic, mimeType })}
          className="w-full"
        >
          {t('idle.startButton')}
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {t('idle.hint')}
        </p>
      </div>
    </Card>
  )
}

export default IdlePanel
```

- [ ] **Step 2: Commit IdlePanel**

```bash
git add tools/tool-screen-recorder/src/components/IdlePanel.tsx
git commit -m "feat(tool-screen-recorder): add IdlePanel with audio toggles and MIME picker"
```


---

## Task 9: Build RecordingPanel Component

**Files:**
- Create: `tools/tool-screen-recorder/src/components/RecordingPanel.tsx`

- [ ] **Step 1: Write RecordingPanel skeleton**

```typescript
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Button } from '@toolbox/ui-kit'
import { Pause, Play, Square, AlertTriangle } from 'lucide-react'
import { formatDuration } from '../lib/formatDuration'

interface RecordingPanelProps {
  state: 'recording' | 'paused'
  elapsedSeconds: number
  estimatedSizeBytes: number
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

const RecordingPanel: React.FC<RecordingPanelProps> = ({
  state,
  elapsedSeconds,
  estimatedSizeBytes,
  onPause,
  onResume,
  onStop,
}) => {
  const { t } = useTranslation('toolScreenRecorder')
  const [warningDismissed, setWarningDismissed] = useState(false)

  const sizeInMB = (estimatedSizeBytes / (1024 * 1024)).toFixed(2)
  const sizeInGB = (estimatedSizeBytes / (1024 * 1024 * 1024)).toFixed(2)
  const showWarning = estimatedSizeBytes > 1024 * 1024 * 1024 && !warningDismissed

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold">
            {formatDuration(elapsedSeconds)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {state === 'recording' ? t('recording.statusRecording') : t('recording.statusPaused')}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">{t('recording.sizeLabel')}</span>
          <span className="font-mono text-sm">
            {estimatedSizeBytes > 1024 * 1024 * 1024 ? `${sizeInGB} GB` : `${sizeInMB} MB`}
          </span>
        </div>

        {showWarning && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t('recording.sizeWarning')}
              </p>
            </div>
            <button
              onClick={() => setWarningDismissed(true)}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex gap-2">
          {state === 'recording' ? (
            <Button onClick={onPause} variant="secondary" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              {t('recording.pauseButton')}
            </Button>
          ) : (
            <Button onClick={onResume} variant="secondary" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              {t('recording.resumeButton')}
            </Button>
          )}
          <Button onClick={onStop} variant="destructive" className="flex-1">
            <Square className="w-4 h-4 mr-2" />
            {t('recording.stopButton')}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default RecordingPanel
```

- [ ] **Step 2: Commit RecordingPanel**

```bash
git add tools/tool-screen-recorder/src/components/RecordingPanel.tsx
git commit -m "feat(tool-screen-recorder): add RecordingPanel with timer, size estimate, and 1GB warning"
```

---

## Task 10: Build FinishedPanel Component

**Files:**
- Create: `tools/tool-screen-recorder/src/components/FinishedPanel.tsx`

- [ ] **Step 1: Write FinishedPanel**

```typescript
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Button } from '@toolbox/ui-kit'
import { Download, RotateCcw } from 'lucide-react'
import { formatDuration } from '../lib/formatDuration'
import { getExtensionForMime } from '../lib/getMimeTypes'

interface FinishedPanelProps {
  videoUrl: string
  durationSeconds: number
  sizeBytes: number
  mimeType: string
  onRestart: () => void
}

const FinishedPanel: React.FC<FinishedPanelProps> = ({
  videoUrl,
  durationSeconds,
  sizeBytes,
  mimeType,
  onRestart,
}) => {
  const { t } = useTranslation('toolScreenRecorder')

  const sizeInMB = (sizeBytes / (1024 * 1024)).toFixed(2)
  const sizeInGB = (sizeBytes / (1024 * 1024 * 1024)).toFixed(2)
  const displaySize = sizeBytes > 1024 * 1024 * 1024 ? `${sizeInGB} GB` : `${sizeInMB} MB`

  const handleDownload = () => {
    const now = new Date()
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '-')
    const ext = getExtensionForMime(mimeType)
    const filename = `screen-recording-${timestamp}.${ext}`

    const a = document.createElement('a')
    a.href = videoUrl
    a.download = filename
    a.click()
  }

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('finished.previewLabel')}</h3>
        
        <video
          src={videoUrl}
          controls
          className="w-full rounded-md bg-black"
        />

        <div className="flex justify-between text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('finished.durationLabel')}: </span>
            <span className="font-mono">{formatDuration(durationSeconds)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('finished.sizeLabel')}: </span>
            <span className="font-mono">{displaySize}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            {t('finished.downloadButton')}
          </Button>
          <Button onClick={onRestart} variant="secondary" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('finished.restartButton')}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default FinishedPanel
```

- [ ] **Step 2: Commit FinishedPanel**

```bash
git add tools/tool-screen-recorder/src/components/FinishedPanel.tsx
git commit -m "feat(tool-screen-recorder): add FinishedPanel with video preview and download"
```

---

## Task 11: Build ErrorPanel Component

**Files:**
- Create: `tools/tool-screen-recorder/src/components/ErrorPanel.tsx`

- [ ] **Step 1: Write ErrorPanel**

```typescript
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Button } from '@toolbox/ui-kit'
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react'
import type { ErrorType } from '../hooks/useScreenRecorder'

interface ErrorPanelProps {
  errorType: ErrorType
  onRetry: () => void
  onBack: () => void
}

const ErrorPanel: React.FC<ErrorPanelProps> = ({ errorType, onRetry, onBack }) => {
  const { t } = useTranslation('toolScreenRecorder')

  const errorMessages: Record<ErrorType, string> = {
    unsupported: t('error.unsupported'),
    permissionDenied: t('error.permissionDenied'),
    deviceError: t('error.deviceError'),
    recordingFailed: t('error.recordingFailed'),
  }

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {errorMessages[errorType]}
          </p>
        </div>

        <div className="flex gap-2">
          {errorType !== 'unsupported' && (
            <Button onClick={onRetry} variant="secondary" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('error.retryButton')}
            </Button>
          )}
          <Button onClick={onBack} variant="secondary" className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('error.backButton')}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ErrorPanel
```

- [ ] **Step 2: Commit ErrorPanel**

```bash
git add tools/tool-screen-recorder/src/components/ErrorPanel.tsx
git commit -m "feat(tool-screen-recorder): add ErrorPanel with distinct error messages"
```

---

## Task 12: Build Main ScreenRecorder Component

**Files:**
- Create: `tools/tool-screen-recorder/src/ScreenRecorder.tsx`
- Modify: `tools/tool-screen-recorder/src/index.tsx`

- [ ] **Step 1: Write main ScreenRecorder component**

```typescript
// tools/tool-screen-recorder/src/ScreenRecorder.tsx
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useScreenRecorder } from './hooks/useScreenRecorder'
import IdlePanel from './components/IdlePanel'
import RecordingPanel from './components/RecordingPanel'
import FinishedPanel from './components/FinishedPanel'
import ErrorPanel from './components/ErrorPanel'

const ScreenRecorder: React.FC = () => {
  const { t } = useTranslation('toolScreenRecorder')
  const {
    state,
    errorType,
    elapsedSeconds,
    estimatedSizeBytes,
    videoUrl,
    finalSizeBytes,
    finalDurationSeconds,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  } = useScreenRecorder()

  // Feature detection on mount
  useEffect(() => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      // Hook will handle unsupported state
    }
  }, [])

  // Check browser support
  if (!navigator.mediaDevices?.getDisplayMedia) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHero
          title={t('title')}
          description={t('description')}
        />
        <ErrorPanel
          errorType="unsupported"
          onRetry={reset}
          onBack={reset}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHero
        title={t('title')}
        description={t('description')}
      />

      {state === 'idle' && (
        <IdlePanel onStart={startRecording} />
      )}

      {state === 'requesting' && (
        <div className="max-w-md mx-auto p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {t('idle.hint')}
          </p>
        </div>
      )}

      {(state === 'recording' || state === 'paused') && (
        <RecordingPanel
          state={state}
          elapsedSeconds={elapsedSeconds}
          estimatedSizeBytes={estimatedSizeBytes}
          onPause={pauseRecording}
          onResume={resumeRecording}
          onStop={stopRecording}
        />
      )}

      {state === 'finished' && videoUrl && (
        <FinishedPanel
          videoUrl={videoUrl}
          durationSeconds={finalDurationSeconds}
          sizeBytes={finalSizeBytes}
          mimeType="video/webm"
          onRestart={reset}
        />
      )}

      {state === 'error' && errorType && (
        <ErrorPanel
          errorType={errorType}
          onRetry={reset}
          onBack={reset}
        />
      )}
    </div>
  )
}

export default ScreenRecorder
```

- [ ] **Step 2: Update index.tsx**

```typescript
// tools/tool-screen-recorder/src/index.tsx
export { default } from './ScreenRecorder'
```

- [ ] **Step 3: Commit main component**

```bash
git add tools/tool-screen-recorder/src/ScreenRecorder.tsx tools/tool-screen-recorder/src/index.tsx
git commit -m "feat(tool-screen-recorder): add main component with state-driven panel switching"
```

---

## Task 13: Write E2E Smoke Test

**Files:**
- Create: `tests/screen-recorder.spec.ts`

- [ ] **Step 1: Write Playwright test**

```typescript
// tests/screen-recorder.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Screen Recorder', () => {
  test('renders idle panel with start button', async ({ page }) => {
    await page.goto('/screen-recorder')

    // Check title
    await expect(page.getByRole('heading', { name: /screen recorder/i })).toBeVisible()

    // Check idle panel elements
    await expect(page.getByText(/recording options/i)).toBeVisible()
    await expect(page.getByText(/include system audio/i)).toBeVisible()
    await expect(page.getByText(/include microphone/i)).toBeVisible()
    await expect(page.getByText(/output format/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /start recording/i })).toBeVisible()

    // Take screenshot
    await page.screenshot({ path: 'docs/tools/screen-recorder/screenshots/idle.png', fullPage: true })
  })

  test('shows unsupported message when getDisplayMedia is unavailable', async ({ page, context }) => {
    // Mock missing API
    await context.addInitScript(() => {
      // @ts-ignore
      delete navigator.mediaDevices.getDisplayMedia
    })

    await page.goto('/screen-recorder')

    await expect(page.getByText(/does not support screen recording/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /start recording/i })).not.toBeVisible()
  })
})
```

- [ ] **Step 2: Run test**

```bash
pnpm test:e2e tests/screen-recorder.spec.ts
```

Expected: PASS (2 tests), screenshot saved to `docs/tools/screen-recorder/screenshots/idle.png`

- [ ] **Step 3: Commit test**

```bash
git add tests/screen-recorder.spec.ts docs/tools/screen-recorder/screenshots/
git commit -m "test(tool-screen-recorder): add e2e smoke test and idle screenshot"
```

---

## Task 14: Final Quality Gate

**Files:**
- All tool files

- [ ] **Step 1: Run consistency check**

```bash
pnpm check:consistency
```

Expected: PASS

- [ ] **Step 2: Run linter**

```bash
pnpm lint
```

Expected: PASS (or auto-fixable warnings only)

- [ ] **Step 3: Run build**

```bash
pnpm -C apps/web build
```

Expected: PASS, no dynamic-import warnings for tool-screen-recorder

- [ ] **Step 4: Run unit tests**

```bash
pnpm test
```

Expected: PASS (formatDuration tests + any others)

- [ ] **Step 5: Manual verification**

Start dev server and verify:

```bash
pnpm dev
```

1. Navigate to `/screen-recorder`
2. Open DevTools Network tab
3. Toggle audio options
4. Click "Start Recording" (will fail without user gesture, but UI should render)
5. Verify zero network requests during the flow

- [ ] **Step 6: Final commit**

If any fixes were needed:

```bash
git add .
git commit -m "fix(tool-screen-recorder): address quality gate issues"
```

---

## Implementation Handoff

This plan is complete. To execute:

1. Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans`
2. Work through Tasks 1-14 in order
3. Each task is 2-5 minutes of focused work
4. Run tests after each logical unit
5. Commit after each task completes

After implementation, proceed to Stage 7 (review chain) per `.claude/commands/create-tools.md`.
