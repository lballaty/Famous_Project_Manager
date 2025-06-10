// src/lib/hybridStorage.ts - Hybrid storage with offline support
import { SupabaseService } from './supabase';
import { Project, Task, Milestone } from '../types/project';
import { User } from '../types/user';

export interface StorageConfig {
  type: 'local' | 'supabase';
  supabaseUrl?: string;
  supabaseKey?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingChanges: number;
  syncInProgress: boolean;
  lastError: string | null;
}

export interface PendingChange {
  id: string;
  type: 'projects' | 'users';
  action: 'create' | 'update' | 'delete';
  entityId: string;
  data: any;
  timestamp: string;
  retryCount: number;
}

export class HybridStorageService {
  private supabaseService: SupabaseService | null = null;
  private config: StorageConfig;
  private syncStatus: SyncStatus = {
    isOnline: false,
    lastSyncTime: null,
    pendingChanges: 0,
    syncInProgress: false,
    lastError: null
  };
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private retryTimer: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor(config: StorageConfig) {
    this.config = config;
    this.initializeService();
    this.setupNetworkMonitoring();
  }

  // Initialize the service based on configuration
  private initializeService() {
    if (this.config.type === 'supabase' && this.config.supabaseUrl && this.config.supabaseKey) {
      try {
        this.supabaseService = new SupabaseService(this.config.supabaseUrl, this.config.supabaseKey);
        this.checkConnection();
      } catch (error) {
        console.warn('Failed to initialize Supabase service:', error);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to initialize Supabase' });
      }
    } else {
      this.updateSyncStatus({ isOnline: false });
    }
  }

  // Monitor network connectivity
  private setupNetworkMonitoring() {
    // Browser network status
    window.addEventListener('online', () => {
      console.log('Network came online');
      this.checkConnection();
    });

    window.addEventListener('offline', () => {
      console.log('Network went offline');
      this.updateSyncStatus({ isOnline: false, lastError: 'Network offline' });
    });

    // Periodic connectivity check
    setInterval(() => {
      if (this.config.type === 'supabase' && this.supabaseService) {
        this.checkConnection();
      }
    }, 30000); // Check every 30 seconds
  }

  // Check if Supabase is reachable
  private async checkConnection(): Promise<boolean> {
    if (!this.supabaseService) {
      this.updateSyncStatus({ isOnline: false });
      return false;
    }

    try {
      // Simple connectivity test
      await this.supabaseService.getUsers();
      this.updateSyncStatus({ 
        isOnline: true, 
        lastError: null 
      });
      
      // Auto-sync if we have pending changes
      if (this.getPendingChanges().length > 0) {
        this.syncToSupabase();
      }
      
      return true;
    } catch (error) {
      console.warn('Supabase connection check failed:', error);
      this.updateSyncStatus({ 
        isOnline: false, 
        lastError: error instanceof Error ? error.message : 'Connection failed' 
      });
      return false;
    }
  }

  // Update configuration
  updateConfig(newConfig: StorageConfig) {
    this.config = newConfig;
    this.initializeService();
  }

  // PROJECTS OPERATIONS
  async getProjects(): Promise<Project[]> {
    if (this.config.type === 'supabase' && this.supabaseService && this.syncStatus.isOnline) {
      try {
        const projects = await this.supabaseService.getProjects();
        // Cache in localStorage as backup
        localStorage.setItem('projects', JSON.stringify(projects));
        localStorage.setItem('projects_cache_time', new Date().toISOString());
        return projects;
      } catch (error) {
        console.warn('Failed to fetch from Supabase, using local storage:', error);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to fetch from Supabase' });
      }
    }

    // Fallback to localStorage
    const stored = localStorage.getItem('projects');
    return stored ? JSON.parse(stored) : [];
  }

  async saveProjects(projects: Project[]): Promise<void> {
    // Always save to localStorage first (immediate)
    localStorage.setItem('projects', JSON.stringify(projects));

    if (this.config.type === 'supabase' && this.supabaseService && this.syncStatus.isOnline) {
      try {
        // Try to save to Supabase
        for (const project of projects) {
          await this.supabaseService.updateProject(project.id, project);
        }
        this.updateSyncStatus({ lastSyncTime: new Date().toISOString() });
      } catch (error) {
        console.warn('Failed to save to Supabase, queuing for sync:', error);
        this.queuePendingChange('projects', 'update', 'all', projects);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to save to Supabase' });
      }
    }
  }

  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID()
    };

    // Always add to localStorage first
    const currentProjects = await this.getProjects();
    const updatedProjects = [...currentProjects, newProject];
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    if (this.config.type === 'supabase' && this.supabaseService && this.syncStatus.isOnline) {
      try {
        await this.supabaseService.createProject(newProject);
        this.updateSyncStatus({ lastSyncTime: new Date().toISOString() });
      } catch (error) {
        console.warn('Failed to create project in Supabase, queuing for sync:', error);
        this.queuePendingChange('projects', 'create', newProject.id, newProject);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to create in Supabase' });
      }
    }

    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    // Update localStorage first
    const currentProjects = await this.getProjects();
    const updatedProjects = currentProjects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    );
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    if (this.config.type === 'supabase' && this.supabaseService && this.syncStatus.isOnline) {
      try {
        await this.supabaseService.updateProject(id, updates);
        this.updateSyncStatus({ lastSyncTime: new Date().toISOString() });
      } catch (error) {
        console.warn('Failed to update project in Supabase, queuing for sync:', error);
        this.queuePendingChange('projects', 'update', id, updates);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to update in Supabase' });
      }
    }
  }

  async deleteProject(id: string): Promise<void> {
    // Delete from localStorage first
    const currentProjects = await this.getProjects();
    const updatedProjects = currentProjects.filter(project => project.id !== id);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    if (this.config.type === 'supabase' && this.supabaseService && this.syncStatus.isOnline) {
      try {
        await this.supabaseService.deleteProject(id);
        this.updateSyncStatus({ lastSyncTime: new Date().toISOString() });
      } catch (error) {
        console.warn('Failed to delete project in Supabase, queuing for sync:', error);
        this.queuePendingChange('projects', 'delete', id, null);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to delete in Supabase' });
      }
    }
  }

  // USERS OPERATIONS (similar pattern)
  async getUsers(): Promise<User[]> {
    if (this.config.type === 'supabase' && this.supabaseService && this.syncStatus.isOnline) {
      try {
        const users = await this.supabaseService.getUsers();
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('users_cache_time', new Date().toISOString());
        return users;
      } catch (error) {
        console.warn('Failed to fetch users from Supabase, using local storage:', error);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to fetch users from Supabase' });
      }
    }

    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  }

  async saveUsers(users: User[]): Promise<void> {
    localStorage.setItem('users', JSON.stringify(users));

    if (this.config.type === 'supabase' && this.supabaseService && this.syncStatus.isOnline) {
      try {
        for (const user of users) {
          await this.supabaseService.updateUser(user.id, user);
        }
        this.updateSyncStatus({ lastSyncTime: new Date().toISOString() });
      } catch (error) {
        console.warn('Failed to save users to Supabase, queuing for sync:', error);
        this.queuePendingChange('users', 'update', 'all', users);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to save users to Supabase' });
      }
    }
  }

  async addUser(user: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      joinedDate: user.joinedDate || new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    const currentUsers = await this.getUsers();
    const updatedUsers = [...currentUsers, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    if (this.config.type === 'supabase' && this.supabaseService && this.syncStatus.isOnline) {
      try {
        await this.supabaseService.createUser(newUser);
        this.updateSyncStatus({ lastSyncTime: new Date().toISOString() });
      } catch (error) {
        console.warn('Failed to create user in Supabase, queuing for sync:', error);
        this.queuePendingChange('users', 'create', newUser.id, newUser);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to create user in Supabase' });
      }
    }

    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const currentUsers = await this.getUsers();
    const updatedUsers = currentUsers.map(user =>
      user.id === id ? { 
        ...user, 
        ...updates, 
        lastActive: new Date().toISOString() 
      } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    if (this.config.type === 'supabase' && this.supabaseService && this.syncStatus.isOnline) {
      try {
        await this.supabaseService.updateUser(id, updates);
        this.updateSyncStatus({ lastSyncTime: new Date().toISOString() });
      } catch (error) {
        console.warn('Failed to update user in Supabase, queuing for sync:', error);
        this.queuePendingChange('users', 'update', id, updates);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to update user in Supabase' });
      }
    }
  }

  async deleteUser(id: string): Promise<void> {
    const currentUsers = await this.getUsers();
    const updatedUsers = currentUsers.filter(user => user.id !== id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    if (this.config.type === 'supabase' && this.supabaseService && this.syncStatus.isOnline) {
      try {
        await this.supabaseService.deleteUser(id);
        this.updateSyncStatus({ lastSyncTime: new Date().toISOString() });
      } catch (error) {
        console.warn('Failed to delete user in Supabase, queuing for sync:', error);
        this.queuePendingChange('users', 'delete', id, null);
        this.updateSyncStatus({ isOnline: false, lastError: 'Failed to delete user in Supabase' });
      }
    }
  }

  // PENDING CHANGES MANAGEMENT
  private queuePendingChange(type: 'projects' | 'users', action: 'create' | 'update' | 'delete', entityId: string, data: any) {
    const pendingChanges = this.getPendingChanges();
    const change: PendingChange = {
      id: crypto.randomUUID(),
      type,
      action,
      entityId,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    pendingChanges.push(change);
    localStorage.setItem('pending_changes', JSON.stringify(pendingChanges));
    
    this.updateSyncStatus({ 
      pendingChanges: pendingChanges.length 
    });

    // Schedule retry
    this.scheduleRetry();
  }

  private getPendingChanges(): PendingChange[] {
    const stored = localStorage.getItem('pending_changes');
    return stored ? JSON.parse(stored) : [];
  }

  private savePendingChanges(changes: PendingChange[]) {
    localStorage.setItem('pending_changes', JSON.stringify(changes));
    this.updateSyncStatus({ pendingChanges: changes.length });
  }

  // SYNC OPERATIONS
  async syncToSupabase(): Promise<void> {
    if (!this.supabaseService || this.syncStatus.syncInProgress) {
      return;
    }

    this.updateSyncStatus({ syncInProgress: true });

    try {
      const pendingChanges = this.getPendingChanges();
      const failedChanges: PendingChange[] = [];

      for (const change of pendingChanges) {
        try {
          await this.processPendingChange(change);
        } catch (error) {
          console.warn('Failed to sync change:', change, error);
          change.retryCount++;
          
          if (change.retryCount < this.maxRetries) {
            failedChanges.push(change);
          } else {
            console.error('Max retries exceeded for change:', change);
          }
        }
      }

      // Save remaining failed changes
      this.savePendingChanges(failedChanges);

      this.updateSyncStatus({ 
        syncInProgress: false,
        lastSyncTime: new Date().toISOString(),
        lastError: failedChanges.length > 0 ? `${failedChanges.length} changes failed to sync` : null
      });

    } catch (error) {
      this.updateSyncStatus({ 
        syncInProgress: false,
        lastError: error instanceof Error ? error.message : 'Sync failed'
      });
    }
  }

  private async processPendingChange(change: PendingChange): Promise<void> {
    if (!this.supabaseService) throw new Error('Supabase service not available');

    switch (change.type) {
      case 'projects':
        switch (change.action) {
          case 'create':
            await this.supabaseService.createProject(change.data);
            break;
          case 'update':
            if (change.entityId === 'all') {
              for (const project of change.data) {
                await this.supabaseService.updateProject(project.id, project);
              }
            } else {
              await this.supabaseService.updateProject(change.entityId, change.data);
            }
            break;
          case 'delete':
            await this.supabaseService.deleteProject(change.entityId);
            break;
        }
        break;

      case 'users':
        switch (change.action) {
          case 'create':
            await this.supabaseService.createUser(change.data);
            break;
          case 'update':
            if (change.entityId === 'all') {
              for (const user of change.data) {
                await this.supabaseService.updateUser(user.id, user);
              }
            } else {
              await this.supabaseService.updateUser(change.entityId, change.data);
            }
            break;
          case 'delete':
            await this.supabaseService.deleteUser(change.entityId);
            break;
        }
        break;
    }
  }

  private scheduleRetry() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    this.retryTimer = setTimeout(() => {
      if (this.config.type === 'supabase' && this.getPendingChanges().length > 0) {
        this.checkConnection().then(isOnline => {
          if (isOnline) {
            this.syncToSupabase();
          }
        });
      }
    }, this.retryDelay);
  }

  // SYNC STATUS MANAGEMENT
  private updateSyncStatus(updates: Partial<SyncStatus>) {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.notifySyncListeners();
  }

  onSyncStatusChange(listener: (status: SyncStatus) => void) {
    this.syncListeners.push(listener);
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  private notifySyncListeners() {
    this.syncListeners.forEach(listener => listener(this.syncStatus));
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // MANUAL SYNC TRIGGER
  async forceSyncToSupabase(): Promise<void> {
    await this.syncToSupabase();
  }

  async forceSyncFromSupabase(): Promise<void> {
    if (!this.supabaseService || !this.syncStatus.isOnline) {
      throw new Error('Supabase not available');
    }

    try {
      const [projects, users] = await Promise.all([
        this.supabaseService.getProjects(),
        this.supabaseService.getUsers()
      ]);

      localStorage.setItem('projects', JSON.stringify(projects));
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('projects_cache_time', new Date().toISOString());
      localStorage.setItem('users_cache_time', new Date().toISOString());

      // Clear pending changes since we're overwriting with server data
      localStorage.removeItem('pending_changes');
      
      this.updateSyncStatus({ 
        lastSyncTime: new Date().toISOString(),
        pendingChanges: 0,
        lastError: null
      });
    } catch (error) {
      this.updateSyncStatus({ 
        lastError: error instanceof Error ? error.message : 'Failed to sync from Supabase'
      });
      throw error;
    }
  }

  // CLEANUP
  dispose() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.syncListeners = [];
  }
}