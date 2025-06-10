export interface SyncStatus {
  lastSynced: string;
  pending: boolean;
  offlineChanges: number;
  autoSyncEnabled: boolean;
  clearLocalOnSync: boolean;
}

export interface ChangeLog {
  id: string;
  entityType: 'task' | 'project' | 'milestone' | 'message';
  entityId: string;
  changeType: 'create' | 'update' | 'delete';
  userId: string;
  timestamp: string;
  beforeState?: any;
  afterState?: any;
  synced: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  projectId?: string;
  synced: boolean;
}

export interface SyncQueue {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retries: number;
}

export interface UserRole {
  userId: string;
  role: 'admin' | 'contributor' | 'viewer';
  projectId?: string;
}