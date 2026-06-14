/** IndexedDB 持久化层。schema 简单：单 store，固定 key='current' 存当前 workspace。 */
import { openDB, type IDBPDatabase } from 'idb'
import type { DiagramWorkspace } from '../domain/types'

const DB_NAME = 'diagram-workbench'
const DB_VERSION = 1
const STORE = 'workspaces'
const KEY = 'current'

let dbPromise: Promise<IDBPDatabase> | null = null

function db(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains(STORE)) {
          d.createObjectStore(STORE)
        }
      },
    })
  }
  return dbPromise
}

export async function getWorkspace(): Promise<DiagramWorkspace | null> {
  const d = await db()
  const v = await d.get(STORE, KEY)
  return (v as DiagramWorkspace | undefined) ?? null
}

export async function saveWorkspace(ws: DiagramWorkspace): Promise<void> {
  const d = await db()
  await d.put(STORE, ws, KEY)
}

export async function clearWorkspace(): Promise<void> {
  const d = await db()
  await d.delete(STORE, KEY)
}

/** 测试用：close 当前连接并清掉 promise 缓存。 */
export async function __resetDbForTests(): Promise<void> {
  if (dbPromise) {
    const d = await dbPromise
    d.close()
    dbPromise = null
  }
}
