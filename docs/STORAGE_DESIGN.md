# 工具盒子 持久化策略设计

## 目标

- 工具数据在刷新后依然可读
- 不强依赖服务端：无服务端时自动降级到浏览器存储
- 服务端提供通用 API，所有工具共用，无需各自实现持久化
- 工具代码无感知底层存储方式（通过统一 hook）

---

## 分级存储策略

```
┌─────────────────────────────────────────────────────┐
│                    工具组件层                         │
│         useToolStorage('habit-tracker', data)        │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                StorageAdapter（自动探测）              │
│                                                     │
│   has server?  ──Yes──▶  ServerStorage (REST API)   │
│       │                  POST /api/store/:ns/:key   │
│       No                 GET  /api/store/:ns/:key   │
│       │                                             │
│       └──────────▶  BrowserStorage                  │
│                    ├─ 小数据 → localStorage          │
│                    └─ 大数据 → IndexedDB             │
└─────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              服务端 (可选)                            │
│   Express + better-sqlite3                          │
│   数据库: toolbox-store.db                           │
│   表: kv_store(ns, key, value, updated_at)          │
└─────────────────────────────────────────────────────┘
```

---

## 数据分级

| 级别 | 数据类型 | 大小 | 存储方案 |
|------|---------|------|----------|
| L1 | UI状态、临时设置 | <10KB | localStorage |
| L2 | 工具数据（习惯、记账、OKR） | <5MB | IndexedDB / SQLite |
| L3 | 大文件（图片、PDF处理结果） | >5MB | IndexedDB (Blob) |

---

## 服务端 API 设计

### 通用键值存储

```
GET    /api/store/:namespace/:key        读取
PUT    /api/store/:namespace/:key        写入
DELETE /api/store/:namespace/:key        删除
GET    /api/store/:namespace             列出所有 key
DELETE /api/store/:namespace             清空 namespace
```

### namespace 规范
- 格式：工具路径名，如 `habit-tracker`、`expense-tracker`
- key：工具自定义，如 `habits`、`records`、`settings`

### 健康检测
```
GET /api/store/ping    返回 {ok: true}
```

---

## 前端 Hook API

```ts
// 基本用法
const { data, save, remove, loading } = useToolStorage<HabitData>(
  'habit-tracker',  // namespace
  'habits',         // key
  defaultValue      // 默认值（首次加载）
)

// 多 key
const storage = useToolStorage('expense-tracker')
await storage.set('records', records)
await storage.set('settings', settings)
const records = await storage.get('records')
```

---

## 自动降级逻辑

1. 应用启动时，`StorageAdapter` 发 `GET /api/store/ping`
2. 200ms 内响应 → 使用 ServerStorage
3. 超时/失败 → 使用 BrowserStorage
4. 降级后不再重试（session 内固定），避免每次操作都超时
5. 服务端恢复后，刷新页面自动切回 ServerStorage

---

## 数据迁移

当用户从「无服务端」切换到「有服务端」时：
- 提供 `migrateToServer()` 方法（可在设置页触发）
- 将 localStorage/IndexedDB 数据批量上传到服务端
- 上传完成后清除本地数据

---

## 文件结构

```
toolbox/
├── packages/
│   └── storage/                    # 公共存储包
│       ├── package.json
│       ├── src/
│       │   ├── index.ts            # 导出所有
│       │   ├── StorageAdapter.ts   # 核心适配器
│       │   ├── ServerStorage.ts    # 服务端存储
│       │   ├── BrowserStorage.ts   # 浏览器存储
│       │   └── useToolStorage.ts   # React Hook
├── server/
│   └── store-api.js               # 通用存储 API 路由
└── toolbox-store.db               # SQLite 数据库（gitignore）
```
