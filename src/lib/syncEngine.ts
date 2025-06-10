import { SyncStatus, ChangeLog, SyncQueue } from '../types/sync';
import { indexedDB } from './indexedDB';

class SyncEngine {
  private syncStatus: SyncStatus = {
    lastSynced: '',
    pending: false,
    offlineChanges: 0,
    autoSyncEnabled: true,
    clearLocalOnSync: false
  };

  private isOnline = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadSyncStatus();
    this.setupOnlineListener();
    if (this.syncStatus.autoSyncEnabled) {
      this.startAutoSync();
    }
  }

  private loadSyncStatus() {
    const stored = localStorage.getItem('syncStatus');
    if (stored) {
      this.syncStatus = { ...this.syncStatus, ...JSON.parse(stored) };
    }
  }

  private saveSyncStatus() {
    localStorage.setItem('syncStatus', JSON.stringify(this.syncStatus));
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (this.syncStatus.autoSyncEnabled) {
        this.syncNow();
      }
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async logChange(entityType: string, entityId: string, changeType: string, beforeState: any, afterState: any) {
    const changeLog: ChangeLog = {
      id: crypto.randomUUID(),
      entityType: entityType as any,
      entityId,
      changeType: changeType as any,
      userId: localStorage.getItem('currentUserId') || 'anonymous',
      timestamp: new Date().toISOString(),
      beforeState,
      afterState,
      synced: false
    };

    await indexedDB.addChangeLog(changeLog);
    this.syncStatus.offlineChanges++;
    this.saveSyncStatus();
  }

  async syncNow(): Promise<boolean> {
    if (!this.isOnline || this.syncStatus.pending) {
      return false;
    }

    this.syncStatus.pending = true;
    this.saveSyncStatus();

    try {
      const unsyncedChanges = await indexedDB.getUnsyncedChanges();
      const syncQueue = await indexedDB.getSyncQueue();

      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.syncStatus.clearLocalOnSync) {
        await indexedDB.clearSyncQueue();
      }

      this.syncStatus.lastSynced = new Date().toISOString();
      this.syncStatus.offlineChanges = 0;
      this.syncStatus.pending = false;
      this.saveSyncStatus();

      return true;
    } catch (error) {
      this.syncStatus.pending = false;
      this.saveSyncStatus();
      return false;
    }
  }

  async prepareForOffline(): Promise<void> {
    // Preload all data from Supabase
    console.log('Preparing for offline use...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  startAutoSync() {
    if (this.syncInterval) return;
    
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncStatus.autoSyncEnabled) {
        this.syncNow();
      }
    }, 30000); // Every 30 seconds
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  updateSyncSettings(settings: Partial<SyncStatus>) {
    this.syncStatus = { ...this.syncStatus, ...settings };
    this.saveSyncStatus();
    
    if (settings.autoSyncEnabled !== undefined) {
      if (settings.autoSyncEnabled) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }
  }
}

export const syncEngine = new SyncEngine();