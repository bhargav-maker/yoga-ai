/**
 * IndexedDB Client-Side Database for Yoga AI
 * 100% offline, persistent, and zero-cost client storage for practice sessions and diagnostic metrics.
 */

const DB_NAME = 'YogaAI_DB';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('poseName', 'poseName', { unique: false });
        store.createIndex('score', 'score', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function saveSessionRecord(session) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const record = {
        ...session,
        timestamp: session.timestamp || new Date().toISOString()
      };
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('Failed to save session to IndexedDB:', err);
    // Fallback to localStorage if IndexedDB encounters issues
    try {
      const existing = JSON.parse(localStorage.getItem('yoga_ai_sessions') || '[]');
      existing.unshift({ ...session, id: Date.now() });
      localStorage.setItem('yoga_ai_sessions', JSON.stringify(existing.slice(0, 100)));
    } catch (e) {
      console.warn('LocalStorage fallback failed:', e);
    }
  }
}

export async function getAllSessionRecords() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const records = request.result || [];
        // Sort newest first
        records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        resolve(records);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Falling back to localStorage for session retrieval:', err);
    try {
      return JSON.parse(localStorage.getItem('yoga_ai_sessions') || '[]');
    } catch {
      return [];
    }
  }
}

export async function deleteSessionRecord(id) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('Failed to delete session record:', err);
  }
}

export async function clearAllSessionRecords() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => {
        try { localStorage.removeItem('yoga_ai_sessions'); } catch {}
        resolve(true);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('Failed to clear session records:', err);
  }
}
