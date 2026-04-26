# AI Chat Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-AI concurrent chat tool that allows users to send questions to multiple AI providers (ChatGPT, Gemini, DeepSeek, Grok) simultaneously and compare their responses in real-time.

**Architecture:** Pure client-side React application with no backend dependencies. Users configure API keys locally in browser localStorage. Supports streaming responses from multiple AI APIs concurrently. Two view modes: grid layout (all responses visible) and tab layout (switch between AIs).

**Tech Stack:** React, TypeScript, react-i18next, localStorage, AI provider SDKs (OpenAI, Google Generative AI, etc.), @toolbox/ui-kit components

---

## File Structure

### New Files to Create

**Tool Package:**
- `tools/tool-ai-chat-hub/package.json` - Package manifest
- `tools/tool-ai-chat-hub/tool.manifest.ts` - Tool registration and metadata
- `tools/tool-ai-chat-hub/src/index.tsx` - Entry point
- `tools/tool-ai-chat-hub/src/AiChatHub.tsx` - Main component
- `tools/tool-ai-chat-hub/src/locales/zh.json` - Chinese i18n
- `tools/tool-ai-chat-hub/src/locales/en.json` - English i18n

**Type Definitions:**
- `tools/tool-ai-chat-hub/src/types.ts` - TypeScript types

**Components:**
- `tools/tool-ai-chat-hub/src/components/ProviderSelector.tsx` - AI provider multi-select
- `tools/tool-ai-chat-hub/src/components/ApiKeyConfig.tsx` - API key configuration panel
- `tools/tool-ai-chat-hub/src/components/PromptInput.tsx` - Unified input box
- `tools/tool-ai-chat-hub/src/components/ResponsePanel.tsx` - Single AI response display
- `tools/tool-ai-chat-hub/src/components/ViewModeToggle.tsx` - Grid/Tab mode switcher
- `tools/tool-ai-chat-hub/src/components/GridView.tsx` - Grid layout container
- `tools/tool-ai-chat-hub/src/components/TabView.tsx` - Tab layout container

**Utilities:**
- `tools/tool-ai-chat-hub/src/utils/storage.ts` - localStorage management
- `tools/tool-ai-chat-hub/src/utils/api-client.ts` - AI API integration

**Tests:**
- `tools/tool-ai-chat-hub/src/types.test.ts` - Type validation tests
- `tools/tool-ai-chat-hub/src/utils/storage.test.ts` - Storage utility tests
- `tools/tool-ai-chat-hub/src/utils/api-client.test.ts` - API client tests
- `tools/tool-ai-chat-hub/src/components/*.test.tsx` - Component tests

---

## Parallel Task Groups

### Group 1: Foundation (Sequential - Must Complete First)

**Task 1.1** and **Task 1.2** must complete before any other tasks.

### Group 2: Independent Components (Parallel - Can Run Concurrently)

**Task 2.1** through **Task 2.8** are independent and can be implemented in parallel by different subagents.

### Group 3: Integration (Sequential - Depends on Group 2)

**Task 3.1** through **Task 3.3** depend on Group 2 completion.

---

## Task 1.1: Scaffold Tool Package

**Files:**
- Create: `tools/tool-ai-chat-hub/` (entire directory structure)

- [ ] **Step 1: Run scaffold command**

```bash
pnpm create:tool ai-chat-hub
```

Expected output: Tool package created with default structure

- [ ] **Step 2: Install dependencies**

```bash
pnpm install
```

Expected output: Workspace packages linked

- [ ] **Step 3: Verify scaffold**

```bash
ls -la tools/tool-ai-chat-hub/
```

Expected output: package.json, tool.manifest.ts, src/ directory exist

- [ ] **Step 4: Commit scaffold**

```bash
git add tools/tool-ai-chat-hub/
git commit -m "feat(tool-ai-chat-hub): scaffold tool package"
```

---

## Task 1.2: Configure Tool Manifest

**Files:**
- Modify: `tools/tool-ai-chat-hub/tool.manifest.ts`

- [ ] **Step 1: Write manifest configuration**

```typescript
import { defineToolManifest } from '@toolbox/tool-registry'
import { MessageSquare } from 'lucide-react'

const toolAiChatHubManifest = defineToolManifest({
  id: 'tool-ai-chat-hub',
  path: '/ai-chat-hub',
  namespace: 'toolAiChatHub',
  mode: 'client',
  categoryKey: 'ai',
  icon: MessageSquare,
  keywords: [
    'ai', 'chat', 'chatgpt', 'gemini', 'deepseek', 'grok',
    'compare', 'concurrent', 'multi-ai',
    'AI', '聊天', '对比', '并发'
  ],
  meta: {
    zh: {
      title: 'AI 聊天中心',
      description: '同时与多个 AI（ChatGPT、Gemini、DeepSeek、Grok）对话并对比回答',
    },
    en: {
      title: 'AI Chat Hub',
      description: 'Chat with multiple AIs (ChatGPT, Gemini, DeepSeek, Grok) simultaneously and compare responses',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolAiChatHubManifest
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm -C tools/tool-ai-chat-hub exec tsc --noEmit
```

Expected output: No errors

- [ ] **Step 3: Commit manifest**

```bash
git add tools/tool-ai-chat-hub/tool.manifest.ts
git commit -m "feat(tool-ai-chat-hub): configure manifest with metadata"
```

---

## Task 1.3: Define TypeScript Types

**Files:**
- Create: `tools/tool-ai-chat-hub/src/types.ts`
- Create: `tools/tool-ai-chat-hub/src/types.test.ts`

- [ ] **Step 1: Write failing type validation test**

```typescript
// tools/tool-ai-chat-hub/src/types.test.ts
import { describe, it, expect } from 'vitest'
import type { AIProvider, APIConfig, Message, ViewMode, ResponseStatus } from './types'

describe('Type Definitions', () => {
  it('should accept valid AIProvider values', () => {
    const providers: AIProvider[] = ['chatgpt', 'gemini', 'deepseek', 'grok']
    expect(providers).toHaveLength(4)
  })

  it('should create valid APIConfig', () => {
    const config: APIConfig = {
      provider: 'chatgpt',
      apiKey: 'sk-test123',
      baseURL: 'https://api.openai.com/v1'
    }
    expect(config.provider).toBe('chatgpt')
  })

  it('should create valid Message', () => {
    const message: Message = {
      role: 'assistant',
      content: 'Hello',
      provider: 'chatgpt',
      timestamp: Date.now()
    }
    expect(message.role).toBe('assistant')
  })

  it('should accept valid ViewMode values', () => {
    const modes: ViewMode[] = ['grid', 'tab']
    expect(modes).toHaveLength(2)
  })

  it('should accept valid ResponseStatus values', () => {
    const statuses: ResponseStatus[] = ['idle', 'loading', 'success', 'error']
    expect(statuses).toHaveLength(4)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm -C tools/tool-ai-chat-hub test types.test.ts
```

Expected: FAIL - types.ts does not exist

- [ ] **Step 3: Write type definitions**

```typescript
// tools/tool-ai-chat-hub/src/types.ts
export type AIProvider = 'chatgpt' | 'gemini' | 'deepseek' | 'grok'

export interface APIConfig {
  provider: AIProvider
  apiKey: string
  baseURL?: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  provider: AIProvider
  timestamp: number
}

export type ViewMode = 'grid' | 'tab'

export type ResponseStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AIResponse {
  provider: AIProvider
  status: ResponseStatus
  content: string
  error?: string
}

export interface ProviderConfig {
  provider: AIProvider
  name: string
  enabled: boolean
  configured: boolean
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm -C tools/tool-ai-chat-hub test types.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit types**

```bash
git add tools/tool-ai-chat-hub/src/types.ts tools/tool-ai-chat-hub/src/types.test.ts
git commit -m "feat(tool-ai-chat-hub): add TypeScript type definitions"
```

---

## Task 2.1: Storage Utility (Parallel Group 2)

**Files:**
- Create: `tools/tool-ai-chat-hub/src/utils/storage.ts`
- Create: `tools/tool-ai-chat-hub/src/utils/storage.test.ts`

- [ ] **Step 1: Write failing test for API key storage**

```typescript
// tools/tool-ai-chat-hub/src/utils/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { saveApiKey, getApiKey, deleteApiKey, getAllApiKeys } from './storage'

describe('Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should save and retrieve API key', () => {
    saveApiKey('chatgpt', 'sk-test123')
    const key = getApiKey('chatgpt')
    expect(key).toBe('sk-test123')
  })

  it('should return null for non-existent key', () => {
    const key = getApiKey('gemini')
    expect(key).toBeNull()
  })

  it('should delete API key', () => {
    saveApiKey('deepseek', 'sk-test456')
    deleteApiKey('deepseek')
    const key = getApiKey('deepseek')
    expect(key).toBeNull()
  })

  it('should get all API keys', () => {
    saveApiKey('chatgpt', 'sk-1')
    saveApiKey('gemini', 'sk-2')
    const keys = getAllApiKeys()
    expect(keys).toEqual({
      chatgpt: 'sk-1',
      gemini: 'sk-2'
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm -C tools/tool-ai-chat-hub test storage.test.ts
```

Expected: FAIL - storage.ts does not exist

- [ ] **Step 3: Write storage utility (part 1)**

```typescript
// tools/tool-ai-chat-hub/src/utils/storage.ts
import type { AIProvider } from '../types'

const STORAGE_KEY_PREFIX = 'ai-chat-hub:api-key:'
const PREFERENCES_KEY = 'ai-chat-hub:preferences'

export function saveApiKey(provider: AIProvider, apiKey: string): void {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${provider}`, apiKey)
}

export function getApiKey(provider: AIProvider): string | null {
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${provider}`)
}

export function deleteApiKey(provider: AIProvider): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${provider}`)
}

export function getAllApiKeys(): Record<string, string> {
  const keys: Record<string, string> = {}
  const providers: AIProvider[] = ['chatgpt', 'gemini', 'deepseek', 'grok']
  
  providers.forEach(provider => {
    const key = getApiKey(provider)
    if (key) {
      keys[provider] = key
    }
  })
  
  return keys
}
```

- [ ] **Step 4: Add preference storage functions**

```typescript
// Append to tools/tool-ai-chat-hub/src/utils/storage.ts

export function saveViewMode(mode: 'grid' | 'tab'): void {
  const prefs = getPreferences()
  prefs.viewMode = mode
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
}

export function getViewMode(): 'grid' | 'tab' {
  const prefs = getPreferences()
  return prefs.viewMode || 'grid'
}

function getPreferences(): { viewMode?: 'grid' | 'tab' } {
  const stored = localStorage.getItem(PREFERENCES_KEY)
  return stored ? JSON.parse(stored) : {}
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm -C tools/tool-ai-chat-hub test storage.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit storage utility**

```bash
git add tools/tool-ai-chat-hub/src/utils/storage.ts tools/tool-ai-chat-hub/src/utils/storage.test.ts
git commit -m "feat(tool-ai-chat-hub): add localStorage utility for API keys"
```

---
