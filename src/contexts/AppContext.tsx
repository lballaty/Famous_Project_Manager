import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, User, StorageConfig } from '@/types/project';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  storageConfig: StorageConfig;
  setStorageConfig: (config: StorageConfig) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  loading: boolean;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  projects: [],
  setProjects: () => {},
  addProject: () => {},
  updateProject: () => {},
  deleteProject: () => {},
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

const PROJECTS_KEY = 'project-tracker-projects';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [storageConfig, setStorageConfig] = useState<StorageConfig>(() => {
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

  // Initialize app and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load projects from localStorage
        const savedProjects = localStorage.getItem(PROJECTS_KEY);
        if (savedProjects) {
          const parsedProjects = JSON.parse(savedProjects);
          setProjectsState(parsedProjects);
        }
        
        // Load user from localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to load app data:', error);
        // Reset to defaults on error
        setProjectsState([]);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Save projects to localStorage whenever they change
  const setProjects = (newProjects: Project[]) => {
    setProjectsState(newProjects);
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: Date.now().toString() };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(p => p.id === id ? { ...p, ...updates } : p);
    setProjects(updatedProjects);
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
  };

  // Save user to localStorage when user changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }, [user]);

  // Save storage config when it changes
  useEffect(() => {
    try {
      localStorage.setItem('storageConfig', JSON.stringify(storageConfig));
    } catch (error) {
      console.error('Failed to save storage config:', error);
    }
  }, [storageConfig]);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        projects,
        setProjects,
        addProject,
        updateProject,
        deleteProject,
        user,
        setUser,
        storageConfig,
        setStorageConfig,
        currentView,
        setCurrentView,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};