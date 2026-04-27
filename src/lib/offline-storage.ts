'use client';

/**
 * Serviço de Gerenciamento de Dados Offline via IndexedDB.
 * Focado em garantir que nenhuma ação do árbitro seja perdida.
 */

export interface OfflineAction {
  id: string; // ID único para idempotência (ex: timestamp_uid)
  matchId: string;
  type: string;
  payload: any;
  timestamp: number;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
}

const DB_NAME = 'ArenaProOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'match_actions';

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('matchId', 'matchId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error('OfflineStorage Error:', request.error);
        reject(request.error);
      };
    });
  }

  async saveAction(action: Omit<OfflineAction, 'status' | 'retryCount'>): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const fullAction: OfflineAction = {
        ...action,
        status: 'PENDING',
        retryCount: 0
      };

      const request = store.add(fullAction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll(IDBKeyRange.only('PENDING'));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateActionStatus(id: string, status: OfflineAction['status'], error?: any): Promise<void> {
    await this.init();
    const action = await this.getAction(id);
    if (!action) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const updatedAction: OfflineAction = {
        ...action,
        status,
        retryCount: status === 'FAILED' ? action.retryCount + 1 : action.retryCount
      };

      const request = store.put(updatedAction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAction(id: string): Promise<OfflineAction | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAction(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();
