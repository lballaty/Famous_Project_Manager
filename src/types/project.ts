export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  progress: number;
  tasks: Task[];
  team: string[];
  color: string;
  milestones?: Milestone[];
  dependencies?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  dependencies?: string[];
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  projectId: string;
}

export interface ProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface StorageConfig {
  type: 'local' | 'supabase';
  supabaseUrl?: string;
  supabaseKey?: string;
}