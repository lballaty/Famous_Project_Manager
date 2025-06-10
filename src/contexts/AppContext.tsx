// src/contexts/AppContext.tsx - Updated with user persistence
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, User } from '../types/project';
import { User as EnhancedUser, TeamMember } from '../types/user';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Enhanced user management
  users: EnhancedUser[];
  setUsers: (users: EnhancedUser[]) => void;
  addUser: (user: Omit<EnhancedUser, 'id'>) => void;
  updateUser: (id: string, updates: Partial<EnhancedUser>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => EnhancedUser | undefined;
  
  user: User | null;
  setUser: (user: User | null) => void;
  storageConfig: StorageConfig;
  setStorageConfig: (config: StorageConfig) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  loading: boolean;
}

interface StorageConfig {
  type: 'local' | 'supabase';
  supabaseUrl?: string;
  supabaseKey?: string;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  projects: [],
  setProjects: () => {},
  addProject: () => {},
  updateProject: () => {},
  deleteProject: () => {},
  users: [],
  setUsers: () => {},
  addUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  getUserById: () => undefined,
  user: null,
  setUser: () => {},
  storageConfig: { type: 'local' },
  setStorageConfig: () => {},
  currentView: 'dashboard',
  setCurrentView: () => {},
  loading: true,
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
  const [storageConfig, setStorageConfigState] = useState<StorageConfig>(() => {
    try {
      const saved = localStorage.getItem('storageConfig');
      return saved ? JSON.parse(saved) : { type: 'local' };
    } catch {
      return { type: 'local' };
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Storage utilities
  const saveToStorage = async (key: string, data: any) => {
    if (storageConfig.type === 'local') {
      localStorage.setItem(key, JSON.stringify(data));
    } else if (storageConfig.type === 'supabase' && storageConfig.supabaseUrl && storageConfig.supabaseKey) {
      // Implement Supabase save logic here
      try {
        // You would implement actual Supabase integration here
        console.log('Would save to Supabase:', key, data);
        // Fallback to localStorage for now
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save to Supabase, using localStorage:', error);
        localStorage.setItem(key, JSON.stringify(data));
      }
    }
  };

  const loadFromStorage = async (key: string) => {
    if (storageConfig.type === 'local') {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } else if (storageConfig.type === 'supabase' && storageConfig.supabaseUrl && storageConfig.supabaseKey) {
      // Implement Supabase load logic here
      try {
        // You would implement actual Supabase integration here
        console.log('Would load from Supabase:', key);
        // Fallback to localStorage for now
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Failed to load from Supabase, using localStorage:', error);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
      }
    }
    return [];
  };

  // Project management functions
  const setProjects = (newProjects: Project[]) => {
    setProjectsState(newProjects);
    saveToStorage('projects', newProjects);
  };

  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID()
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    );
    setProjects(updatedProjects);
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
  };

  // User management functions
  const setUsers = (newUsers: EnhancedUser[]) => {
    setUsersState(newUsers);
    saveToStorage('users', newUsers);
  };

  const addUser = (userData: Omit<EnhancedUser, 'id'>) => {
    const newUser: EnhancedUser = {
      ...userData,
      id: crypto.randomUUID(),
      joinedDate: userData.joinedDate || new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
  };

  const updateUser = (id: string, updates: Partial<EnhancedUser>) => {
    const updatedUsers = users.map(user =>
      user.id === id ? { 
        ...user, 
        ...updates, 
        lastActive: new Date().toISOString() 
      } : user
    );
    setUsers(updatedUsers);
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    
    // Also remove user from all project teams
    const updatedProjects = projects.map(project => ({
      ...project,
      teamMembers: project.teamMembers?.filter(tm => tm.userId !== id) || [],
      projectManager: project.projectManager === id ? undefined : project.projectManager
    }));
    setProjects(updatedProjects);
  };

  const getUserById = (id: string): EnhancedUser | undefined => {
    return users.find(user => user.id === id);
  };

  const setStorageConfig = (config: StorageConfig) => {
    setStorageConfigState(config);
    localStorage.setItem('storageConfig', JSON.stringify(config));
  };

  // Initialize app and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Load projects and users from storage
        const [storedProjects, storedUsers] = await Promise.all([
          loadFromStorage('projects'),
          loadFromStorage('users')
        ]);
        
        setProjectsState(storedProjects || []);
        setUsersState(storedUsers || []);
        
        // Load current user from storage if exists
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          setUser(JSON.parse(currentUser));
        }
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [storageConfig]);

  // Save current user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
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
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}