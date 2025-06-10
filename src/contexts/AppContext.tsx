// src/contexts/AppContext.tsx - Enhanced with error handling and logging integration
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, User } from '../types/project';
import { User as EnhancedUser, TeamMember } from '../types/user';
import { SyncError, SyncMetrics, LogCategory } from '../types/sync';
import { HybridStorageService, StorageConfig } from '../lib/hybridStorage';
import { syncLogger } from '../utils/logger';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Enhanced user management
  users: EnhancedUser[];
  setUsers: (users: EnhancedUser[]) => void;
  addUser: (user: Omit<EnhancedUser, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<EnhancedUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUserById: (id: string) => EnhancedUser | undefined;
  
  user: User | null;
  setUser: (user: User | null) => void;
  storageConfig: StorageConfig;
  setStorageConfig: (config: StorageConfig) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  loading: boolean;

  // NEW: Enhanced sync and error management
  storageService: HybridStorageService;
  syncErrors: SyncError[];
  syncMetrics: SyncMetrics;
  clearSyncErrors: (errorIds?: string[]) => void;
  retryFailedSync: (errorId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  projects: [],
  setProjects: () => {},
  addProject: async () => {},
  updateProject: async () => {},
  deleteProject: async () => {},
  users: [],
  setUsers: () => {},
  addUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
  getUserById: () => undefined,
  user: null,
  setUser: () => {},
  storageConfig: { type: 'local' },
  setStorageConfig: () => {},
  currentView: 'dashboard',
  setCurrentView: () => {},
  loading: true,
  storageService: null as any,
  syncErrors: [],
  syncMetrics: {
    totalAttempts: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    averageResponseTime: 0,
    currentStreak: { type: 'success', count: 0 }
  },
  clearSyncErrors: () => {},
  retryFailedSync: async () => {},
  refreshData: async () => {}
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [users, setUsersState] = useState<EnhancedUser[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [syncErrors, setSyncErrors] = useState<SyncError[]>([]);
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics>(defaultAppContext.syncMetrics);

  // Enhanced storage configuration with persistence
  const [storageConfig, setStorageConfigState] = useState<StorageConfig>(() => {
    try {
      const saved = localStorage.getItem('storageConfig');
      const config = saved ? JSON.parse(saved) : { type: 'local' };
      
      syncLogger.info(LogCategory.DATABASE, 'Loaded storage configuration', { config });
      return config;
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to load storage configuration', { error });
      return { type: 'local' };
    }
  });

  // Initialize storage service
  const [storageService] = useState(() => {
    const service = new HybridStorageService(storageConfig);
    
    // Subscribe to error updates
    const updateErrors = () => {
      setSyncErrors(service.getSyncErrors());
      setSyncMetrics(service.getSyncMetrics());
    };

    // Monitor for errors every 5 seconds
    const errorInterval = setInterval(updateErrors, 5000);
    
    // Cleanup function stored in service
    (service as any).cleanup = () => clearInterval(errorInterval);
    
    return service;
  });

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Enhanced project management with comprehensive error handling
  const setProjects = async (newProjects: Project[]) => {
    try {
      setProjectsState(newProjects);
      await storageService.saveProjects(newProjects);
      
      syncLogger.info(LogCategory.DATABASE, 'Projects updated successfully', {
        count: newProjects.length
      });
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to save projects', { 
        error: error.message,
        count: newProjects.length 
      });
      
      // Still update local state even if sync fails
      setProjectsState(newProjects);
      throw error;
    }
  };

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    try {
      syncLogger.info(LogCategory.DATABASE, 'Adding new project', { 
        name: projectData.name 
      });

      const newProject = await storageService.addProject(projectData);
      const updatedProjects = [...projects, newProject];
      setProjectsState(updatedProjects);

      syncLogger.info(LogCategory.DATABASE, 'Project added successfully', { 
        id: newProject.id,
        name: newProject.name 
      });
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to add project', { 
        error: error.message,
        projectName: projectData.name 
      });
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      syncLogger.info(LogCategory.DATABASE, 'Updating project', { 
        id,
        fields: Object.keys(updates) 
      });

      await storageService.updateProject(id, updates);
      
      const updatedProjects = projects.map(project =>
        project.id === id ? { ...project, ...updates } : project
      );
      setProjectsState(updatedProjects);

      syncLogger.info(LogCategory.DATABASE, 'Project updated successfully', { id });
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to update project', { 
        error: error.message,
        id 
      });
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const project = projects.find(p => p.id === id);
      
      syncLogger.info(LogCategory.DATABASE, 'Deleting project', { 
        id,
        name: project?.name 
      });

      await storageService.deleteProject(id);
      
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjectsState(updatedProjects);

      syncLogger.info(LogCategory.DATABASE, 'Project deleted successfully', { id });
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to delete project', { 
        error: error.message,
        id 
      });
      throw error;
    }
  };

  // Enhanced user management with error handling
  const setUsers = async (newUsers: EnhancedUser[]) => {
    try {
      setUsersState(newUsers);
      await storageService.saveUsers(newUsers);
      
      syncLogger.info(LogCategory.DATABASE, 'Users updated successfully', {
        count: newUsers.length
      });
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to save users', { 
        error: error.message,
        count: newUsers.length 
      });
      
      setUsersState(newUsers);
      throw error;
    }
  };

  const addUser = async (userData: Omit<EnhancedUser, 'id'>) => {
    try {
      syncLogger.info(LogCategory.DATABASE, 'Adding new user', { 
        email: userData.email 
      });

      const newUser = await storageService.addUser(userData);
      const updatedUsers = [...users, newUser];
      setUsersState(updatedUsers);

      syncLogger.info(LogCategory.DATABASE, 'User added successfully', { 
        id: newUser.id,
        email: newUser.email 
      });
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to add user', { 
        error: error.message,
        email: userData.email 
      });
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<EnhancedUser>) => {
    try {
      syncLogger.info(LogCategory.DATABASE, 'Updating user', { 
        id,
        fields: Object.keys(updates) 
      });

      await storageService.updateUser(id, updates);
      
      const updatedUsers = users.map(user =>
        user.id === id ? { 
          ...user, 
          ...updates, 
          lastActive: new Date().toISOString() 
        } : user
      );
      setUsersState(updatedUsers);

      syncLogger.info(LogCategory.DATABASE, 'User updated successfully', { id });
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to update user', { 
        error: error.message,
        id 
      });
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const userToDelete = users.find(u => u.id === id);
      
      syncLogger.info(LogCategory.DATABASE, 'Deleting user', { 
        id,
        email: userToDelete?.email 
      });

      await storageService.deleteUser(id);
      
      const updatedUsers = users.filter(user => user.id !== id);
      setUsersState(updatedUsers);
      
      // Also remove user from all project teams
      const updatedProjects = projects.map(project => ({
        ...project,
        teamMembers: project.teamMembers?.filter(tm => tm.userId !== id) || [],
        projectManager: project.projectManager === id ? undefined : project.projectManager
      }));
      setProjectsState(updatedProjects);

      syncLogger.info(LogCategory.DATABASE, 'User deleted successfully', { id });
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to delete user', { 
        error: error.message,
        id 
      });
      throw error;
    }
  };

  const getUserById = (id: string): EnhancedUser | undefined => {
    return users.find(user => user.id === id);
  };

  const setStorageConfig = (config: StorageConfig) => {
    try {
      syncLogger.info(LogCategory.DATABASE, 'Updating storage configuration', { 
        from: storageConfig.type,
        to: config.type 
      });

      setStorageConfigState(config);
      localStorage.setItem('storageConfig', JSON.stringify(config));
      storageService.updateConfig(config);
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to update storage configuration', { 
        error: error.message,
        config 
      });
      throw error;
    }
  };

  // NEW: Enhanced error management
  const clearSyncErrors = (errorIds?: string[]) => {
    storageService.clearSyncErrors(errorIds);
    setSyncErrors(storageService.getSyncErrors());
    
    syncLogger.info(LogCategory.SYNC, 'Sync errors cleared', { 
      errorIds: errorIds?.length || 'all' 
    });
  };

  const retryFailedSync = async (errorId: string) => {
    try {
      syncLogger.info(LogCategory.SYNC, 'Retrying failed sync', { errorId });
      
      await storageService.retryFailedSync(errorId);
      
      // Refresh error state
      setSyncErrors(storageService.getSyncErrors());
      setSyncMetrics(storageService.getSyncMetrics());
      
      syncLogger.info(LogCategory.SYNC, 'Sync retry completed successfully', { errorId });
    } catch (error) {
      syncLogger.error(LogCategory.SYNC, 'Sync retry failed', { 
        error: error.message,
        errorId 
      });
      throw error;
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      
      syncLogger.info(LogCategory.DATABASE, 'Refreshing data from storage');

      const [freshProjects, freshUsers] = await Promise.all([
        storageService.getProjects(),
        storageService.getUsers()
      ]);
      
      setProjectsState(freshProjects);
      setUsersState(freshUsers);
      
      syncLogger.info(LogCategory.DATABASE, 'Data refresh completed', {
        projects: freshProjects.length,
        users: freshUsers.length
      });
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to refresh data', { 
        error: error.message 
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Initialize app and load data with enhanced error handling
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        syncLogger.info(LogCategory.DATABASE, 'Initializing application');
        
        // Load projects and users from storage service
        const [storedProjects, storedUsers] = await Promise.all([
          storageService.getProjects(),
          storageService.getUsers()
        ]);
        
        setProjectsState(storedProjects || []);
        setUsersState(storedUsers || []);
        
        // Load current user from storage if exists
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const parsedUser = JSON.parse(currentUser);
          setUser(parsedUser);
          
          syncLogger.info(LogCategory.AUTH, 'Current user loaded', { 
            userId: parsedUser.id,
            email: parsedUser.email 
          });
        }
        
        syncLogger.info(LogCategory.DATABASE, 'Application initialized successfully', {
          projects: storedProjects?.length || 0,
          users: storedUsers?.length || 0,
          hasCurrentUser: !!currentUser
        });
        
      } catch (error) {
        syncLogger.error(LogCategory.DATABASE, 'Failed to initialize application', { 
          error: error.message 
        });
        
        // Set empty arrays as fallback
        setProjectsState([]);
        setUsersState([]);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      if ((storageService as any).cleanup) {
        (storageService as any).cleanup();
      }
      storageService.dispose();
    };
  }, [storageService]);

  // Save current user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      syncLogger.info(LogCategory.AUTH, 'Current user updated', { 
        userId: user.id,
        email: user.email 
      });
    } else {
      localStorage.removeItem('currentUser');
      syncLogger.info(LogCategory.AUTH, 'Current user cleared');
    }
  }, [user]);

  const value: AppContextType = {
    sidebarOpen,
    toggleSidebar,
    projects,
    setProjects,
    addProject,
    updateProject,
    deleteProject,
    users,
    setUsers,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    user,
    setUser,
    storageConfig,
    setStorageConfig,
    currentView,
    setCurrentView,
    loading,
    storageService,
    syncErrors,
    syncMetrics,
    clearSyncErrors,
    retryFailedSync,
    refreshData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}