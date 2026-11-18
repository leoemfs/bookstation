/** Armazenamento local em IndexedDB (chave → valor), com localStorage como reserva. Base copiada do CP Hub. */
const DB_NAME = 'bookstation';
const STORE = 'kv';
const RESERVA = 'bookstation:kv:';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB indisponível'));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => (dbPromise = null));
  }
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
}

export async function dbGet<T>(key: string): Promise<T | undefined> {
  try {
    const v = (await run('readonly', (s) => s.get(key))) as T | undefined;
    if (v !== undefined) return v;
  } catch {
    /* usa a reserva */
  }
  const raw = localStorage.getItem(RESERVA + key);
  return raw ? (JSON.parse(raw) as T) : undefined;
}

/** Grava no banco principal; se falhar, na reserva (e devolve 'reserva' para avisar). */
export async function dbSet(key: string, value: unknown): Promise<'ok' | 'reserva'> {
  try {
    await run('readwrite', (s) => s.put(value, key));
  } catch {
    localStorage.setItem(RESERVA + key, JSON.stringify(value));
    return 'reserva';
  }
  try {
    localStorage.removeItem(RESERVA + key);
  } catch {
    /* ignora */
  }
  return 'ok';
}

/** Pede ao navegador para não apagar os dados sozinho quando faltar espaço. */
export function pedirPersistencia(): void {
  try {
    navigator.storage?.persist?.();
  } catch {
    /* ignora */
  }
}

export async function espacoUsado(): Promise<number | null> {
  try {
    const e = await navigator.storage?.estimate?.();
    return e?.usage ?? null;
  } catch {
    return null;
  }
}
