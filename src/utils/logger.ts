// src/utils/logger.ts - Logging system that integrates with your existing architecture
import { LogLevel, LogCategory, LogEntry, LoggerConfig } from '../types/sync';

class SyncLogger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private sessionId: string;
  private listeners: ((entry: LogEntry) => void)[] = [];

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.config = this.loadConfig();
    this.loadPersistedLogs();
  }

  private loadConfig(): LoggerConfig {
    const saved = localStorage.getItem('sync_logger_config');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      level: LogLevel.WARN,
      categories: Object.values(LogCategory),
      maxEntries: 1000,
      persistToLocal: true,
      sendToServer: false,
      realTimeDisplay: false
    };
  }

  updateConfig(updates: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...updates };
    localStorage.setItem('sync_logger_config', JSON.stringify(this.config));
  }

  private loadPersistedLogs() {
    if (!this.config.persistToLocal) return;
    
    try {
      const saved = localStorage.getItem('sync_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.logs = parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load persisted logs:', error);
    }
  }

  private persistLogs() {
    if (!this.config.persistToLocal) return;
    
    try {
      const recentLogs = this.logs.slice(-this.config.maxEntries);
      localStorage.setItem('sync_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to persist logs:', error);
    }
  }

  log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: any,
    context?: LogEntry['context']
  ) {
    if (!this.config.enabled) return;
    if (level < this.config.level) return;
    if (!this.config.categories.includes(category)) return;

    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      category,
      message,
      details: details ? this.sanitizeDetails(details) : undefined,
      sessionId: this.sessionId,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    // Capture stack trace for errors
    if (level >= LogLevel.ERROR) {
      entry.stackTrace = new Error().stack;
    }

    this.logs.push(entry);
    
    // Trim old logs
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    this.persistLogs();
    this.notifyListeners(entry);

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level >= LogLevel.ERROR ? console.error :
                       level >= LogLevel.WARN ? console.warn :
                       level >= LogLevel.INFO ? console.info : console.debug;
      
      logMethod(`[${LogCategory[category]}] ${message}`, details);
    }
  }

  private sanitizeDetails(details: any): any {
    if (typeof details === 'object' && details !== null) {
      const sanitized = { ...details };
      
      // Remove sensitive keys
      const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
      sensitiveKeys.forEach(key => {
        if (key in sanitized) {
          sanitized[key] = '[REDACTED]';
        }
      });

      return sanitized;
    }
    
    return details;
  }

  // Convenience methods
  debug(category: LogCategory, message: string, details?: any, context?: LogEntry['context']) {
    this.log(LogLevel.DEBUG, category, message, details, context);
  }

  info(category: LogCategory, message: string, details?: any, context?: LogEntry['context']) {
    this.log(LogLevel.INFO, category, message, details, context);
  }

  warn(category: LogCategory, message: string, details?: any, context?: LogEntry['context']) {
    this.log(LogLevel.WARN, category, message, details, context);
  }

  error(category: LogCategory, message: string, details?: any, context?: LogEntry['context']) {
    this.log(LogLevel.ERROR, category, message, details, context);
  }

  critical(category: LogCategory, message: string, details?: any, context?: LogEntry['context']) {
    this.log(LogLevel.CRITICAL, category, message, details, context);
  }

  // Sync-specific convenience methods that work with your existing syncEngine
  syncStart(operation: string, entityType: string, entityId: string) {
    this.debug(LogCategory.SYNC, `Starting ${operation}`, null, {
      operation,
      entityType,
      entityId
    });
  }

  syncSuccess(operation: string, entityType: string, entityId: string, duration: number) {
    this.info(LogCategory.SYNC, `${operation} completed successfully`, {
      duration: `${duration}ms`
    }, {
      operation,
      entityType,
      entityId
    });
  }

  syncError(operation: string, entityType: string, entityId: string, error: any, attempt: number) {
    this.error(LogCategory.SYNC, `${operation} failed`, {
      error: error.message || error,
      attempt,
      errorCode: error.code,
      statusCode: error.status
    }, {
      operation,
      entityType,
      entityId,
      attempt
    });
  }

  // Network status logging to complement your HybridStorageService
  networkStatusChange(isOnline: boolean, details?: any) {
    this.info(LogCategory.NETWORK, `Network status: ${isOnline ? 'online' : 'offline'}`, details);
  }

  // Storage operation logging to complement your storage methods
  storageOperation(operation: string, storageType: 'local' | 'supabase', entityType: string, success: boolean, details?: any) {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const message = `Storage ${operation} ${success ? 'succeeded' : 'failed'} (${storageType})`;
    
    this.log(level, LogCategory.DATABASE, message, details, {
      operation,
      entityType
    });
  }

  // Utility methods
  getLogs(filters?: {
    level?: LogLevel;
    category?: LogCategory;
    since?: Date;
    entityType?: string;
    operation?: string;
  }): LogEntry[] {
    let filtered = [...this.logs];

    if (filters) {
      if (filters.level !== undefined) {
        filtered = filtered.filter(log => log.level >= filters.level!);
      }
      if (filters.category) {
        filtered = filtered.filter(log => log.category === filters.category);
      }
      if (filters.since) {
        filtered = filtered.filter(log => log.timestamp >= filters.since!);
      }
      if (filters.entityType) {
        filtered = filtered.filter(log => log.context?.entityType === filters.entityType);
      }
      if (filters.operation) {
        filtered = filtered.filter(log => log.context?.operation === filters.operation);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  clearLogs() {
    this.logs = [];
    this.persistLogs();
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Entity Type', 'Entity ID', 'Operation', 'Details'];
      const rows = this.logs.map(log => [
        log.timestamp.toISOString(),
        LogLevel[log.level],
        log.category,
        log.message,
        log.context?.entityType || '',
        log.context?.entityId || '',
        log.context?.operation || '',
        log.details ? JSON.stringify(log.details) : ''
      ]);
      
      return [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }

  subscribe(listener: (entry: LogEntry) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(entry: LogEntry) {
    this.listeners.forEach(listener => {
      try {
        listener(entry);
      } catch (error) {
        console.warn('Log listener error:', error);
      }
    });
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

export const syncLogger = new SyncLogger();