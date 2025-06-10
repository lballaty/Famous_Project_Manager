// src/types/sync.ts - Enhanced with comprehensive error handling and logging
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

// NEW: Enhanced error handling types
export interface SyncError {
  id: string;
  type: 'network' | 'auth' | 'validation' | 'conflict' | 'timeout' | 'server' | 'unknown';
  operation: string;
  entityType: string;
  entityId: string;
  message: string;
  details: any;
  timestamp: Date;
  attempt: number;
  isRetryable: boolean;
  suggestedAction?: string;
  resolved?: boolean;
}

export interface SyncMetrics {
  totalAttempts: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageResponseTime: number;
  lastSuccessfulSync?: Date;
  currentStreak: { type: 'success' | 'failure'; count: number };
}

// NEW: Logging system types
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export enum LogCategory {
  SYNC = 'sync',
  DATABASE = 'database',
  NETWORK = 'network',
  AUTH = 'auth',
  VALIDATION = 'validation',
  PERFORMANCE = 'performance'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  userId?: string;
  sessionId: string;
  stackTrace?: string;
  context?: {
    entityType?: string;
    entityId?: string;
    operation?: string;
    attempt?: number;
    userAgent?: string;
    url?: string;
  };
}

export interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  categories: LogCategory[];
  maxEntries: number;
  persistToLocal: boolean;
  sendToServer: boolean;
  realTimeDisplay: boolean;
}

// NEW: Offline mode types
export interface OfflineMode {
  type: 'auto' | 'offline_locked' | 'offline_manual' | 'paused';
  reason?: string;
  until?: Date;
}

// NEW: Lock management types
export interface ProjectLock {
  id: string;
  project_id: string;
  locked_by_user_id: string;
  locked_by_email: string;
  locked_by_name: string;
  locked_at: string;
  expires_at: string;
  lock_reason?: string;
  is_active: boolean;
}