/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class WorkspaceIndexedDB {
  private dbName = 'trecko_command_center_db';
  private version = 1;

  getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('boards')) {
          db.createObjectStore('boards', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('crm')) {
          db.createObjectStore('crm', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
      };
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('IndexedDB read error, falling back to localStorage:', e);
      const saved = localStorage.getItem(`trecko_db_fallback_${storeName}`);
      return saved ? JSON.parse(saved) : [];
    }
  }

  async put(storeName: string, item: any): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('IndexedDB write error, falling back to localStorage:', e);
      const items = await this.getAll(storeName);
      const index = items.findIndex(i => i.id === item.id);
      if (index > -1) {
        items[index] = item;
      } else {
        items.push(item);
      }
      localStorage.setItem(`trecko_db_fallback_${storeName}`, JSON.stringify(items));
    }
  }

  async delete(storeName: string, id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('IndexedDB delete error, falling back to localStorage:', e);
      const items = await this.getAll(storeName);
      const filtered = items.filter(i => i.id !== id);
      localStorage.setItem(`trecko_db_fallback_${storeName}`, JSON.stringify(filtered));
    }
  }
}

export const localDB = new WorkspaceIndexedDB();
