import { useState, useEffect } from 'react';
import { Project, Task } from '@/types/project';

const STORAGE_KEY = 'project-tracker-data';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'in-progress',
    priority: 'high',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    progress: 65,
    tasks: [],
    team: ['Alice', 'Bob', 'Charlie'],
    color: '#3b82f6'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android',
    status: 'planning',
    priority: 'medium',
    startDate: '2024-02-01',
    endDate: '2024-06-01',
    progress: 15,
    tasks: [],
    team: ['David', 'Eve'],
    color: '#10b981'
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setProjects(JSON.parse(stored));
    } else {
      setProjects(mockProjects);
    }
  }, []);

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: Date.now().toString() };
    saveProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updated = projects.map(p => p.id === id ? { ...p, ...updates } : p);
    saveProjects(updated);
  };

  const deleteProject = (id: string) => {
    saveProjects(projects.filter(p => p.id !== id));
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject
  };
};