// ─── TINY INDEXEDDB WRAPPER ─────────────────────────────────────────────────
// One database, one object store of pending writes keyed by an auto-increment
// sequence (so replay order == capture order). No dependency on purpose.

const DB_NAME = 'spd-consult-offline'
const STORE   = 'ops'

let dbPromise: Promise<IDBDatabase> | null = null

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'seq', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => { dbPromise = null; reject(req.error) }
  })
  return dbPromise
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(db => new Promise<T>((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  }))
}

export function idbAdd<T>(value: T): Promise<IDBValidKey> {
  return tx('readwrite', s => s.add(value))
}

export function idbAll<T>(): Promise<T[]> {
  return tx('readonly', s => s.getAll() as IDBRequest<T[]>)
}

export function idbDelete(key: IDBValidKey): Promise<undefined> {
  return tx('readwrite', s => s.delete(key))
}

export function idbCount(): Promise<number> {
  return tx('readonly', s => s.count())
}
