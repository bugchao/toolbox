# @toolbox/storage

工具盒子通用持久化存储包。自动探测服务端可用性，降级到浏览器存储。

## 快速上手

```tsx
import { useToolStorage } from '@toolbox/storage'

interface HabitData {
  habits: Habit[]
  lastUpdated: number
}

const DEFAULT: HabitData = { habits: [], lastUpdated: 0 }

export function HabitTracker() {
  const { data, save, loading, backend } = useToolStorage<HabitData>(
    'habit-tracker',  // namespace（工具路由名）
    'data',           // key
    DEFAULT           // 默认值
  )

  if (loading) return <div>加载中...</div>

  const addHabit = (name: string) => {
    save({ ...data, habits: [...data.habits, { id: Date.now(), name }] })
  }

  return (
    <div>
      {/* backend 显示当前存储方式 */}
      <span>存储: {backend === 'server' ? '☁️ 服务端' : '💾 本地'}</span>
      {data.habits.map(h => <div key={h.id}>{h.name}</div>)}
    </div>
  )
}
```

## 存储分级

| 场景 | 方案 | 说明 |
|------|------|------|
| 有服务端 | SQLite via REST API | 数据持久化，多设备共享 |
| 无服务端（<100KB） | localStorage | 同步读取，简单快速 |
| 无服务端（>100KB） | IndexedDB | 异步，支持大数据 |

## API

### useToolStorage(namespace, key, defaultValue)

```ts
const {
  data,      // 当前数据（T）
  save,      // (value: T) => Promise<void>
  remove,    // () => Promise<void>
  loading,   // boolean
  backend,   // 'server' | 'browser' | null
  listKeys,  // () => Promise<string[]>
  getKey,    // <V>(key, default) => Promise<V>  多key场景
  setKey,    // <V>(key, value) => Promise<void>
} = useToolStorage<T>(namespace, key, defaultValue)
```

### StorageAdapter（直接使用）

```ts
import { StorageAdapter } from '@toolbox/storage'

await StorageAdapter.set('my-tool', 'config', { theme: 'dark' })
const config = await StorageAdapter.get('my-tool', 'config')
await StorageAdapter.remove('my-tool', 'config')
```

## 服务端 API

需要安装 `better-sqlite3`：

```bash
npm install better-sqlite3
```

已在 server.js 注册，无需额外配置。

| Method | Path | 说明 |
|--------|------|------|
| GET | /api/store/ping | 健康检测 |
| GET | /api/store/:ns | 列出所有 key |
| GET | /api/store/:ns/:key | 读取值 |
| PUT | /api/store/:ns/:key | 写入值 |
| DELETE | /api/store/:ns/:key | 删除值 |
| DELETE | /api/store/:ns | 清空 namespace |

## 数据迁移

从无服务端切换到有服务端后，可迁移本地数据：

```ts
import { StorageAdapter } from '@toolbox/storage'

const result = await StorageAdapter.migrateToServer()
console.log(`迁移完成: ${result.migrated} 条成功, ${result.errors} 条失败`)
```
