import { ChangeLog, SyncQueue, ChatMessage } from '../types/sync';

class IndexedDBManager {
  private dbName = 'ProjectTrackerDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    // Check if IndexedDB is available
    if (typeof indexedDB === 'undefined') {
      console.warn('IndexedDB not available, using localStorage fallback');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.version);
        
        request.onerror = () => {
          console.error('IndexedDB error:', request.error);
          resolve(); // Don't reject, just continue without IndexedDB
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Projects store
          if (!db.objectStoreNames.contains('projects')) {
            const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
            projectStore.createIndex('name', 'name');
            projectStore.createIndex('status', 'status');
          }
          
          // Change log store
          if (!db.objectStoreNames.contains('changeLogs')) {
            const changeLogStore = db.createObjectStore('changeLogs', { keyPath: 'id' });
            changeLogStore.createIndex('entityType', 'entityType');
            changeLogStore.createIndex('synced', 'synced');
          }
          
          // Sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id' });
          }
          
          // Chat messages store
          if (!db.objectStoreNames.contains('chatMessages')) {
            const chatStore = db.createObjectStore('chatMessages', { keyPath: 'id' });
            chatStore.createIndex('timestamp', 'timestamp');
            chatStore.createIndex('synced', 'synced');
          }
        };
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
        resolve(); // Continue without IndexedDB
      }
    });
  }

  async saveProjects(projects: any[]): Promise<void> {
    if (!this.db) return;
    try {
      const transaction = this.db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      await store.clear();
      for (const project of projects) {
        await store.add(project);
      }
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  async getProjects(): Promise<any[]> {
    if (!this.db) return [];
    try {
      const transaction = this.db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.getAll();
      
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async addChangeLog(changeLog: ChangeLog): Promise<void> {
    if (!this.db) return;
    try {
      const transaction = this.db.transaction(['changeLogs'], 'readwrite');
      const store = transaction.objectStore('changeLogs');
      await store.add(changeLog);
    } catch (error) {
      console.error('Error adding change log:', error);
    }
  }

  async getUnsyncedChanges(): Promise<ChangeLog[]> {
    if (!this.db) return [];
    try {
      const transaction = this.db.transaction(['changeLogs'], 'readonly');
      const store = transaction.objectStore('changeLogs');
      const index = store.index('synced');
      const request = index.getAll(false);
      
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (error) {
      console.error('Error getting unsynced changes:', error);
      return [];
    }
  }

  async addChatMessage(message: ChatMessage): Promise<void> {
    if (!this.db) return;
    try {
      const transaction = this.db.transaction(['chatMessages'], 'readwrite');
      const store = transaction.objectStore('chatMessages');
      await store.add(message);
    } catch (error) {
      console.error('Error adding chat message:', error);
    }
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    if (!this.db) return [];
    try {
      const transaction = this.db.transaction(['chatMessages'], 'readonly');
      const store = transaction.objectStore('chatMessages');
      const request = store.getAll();
      
      return new Promise((resolve) => {
        request.onsuccess = () => resolve((request.result || []).sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ));
        request.onerror = () => resolve([]);
      });
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }
}

export const indexedDB = new IndexedDBManager();