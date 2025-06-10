
// Import the new user types
import { User, TeamMember } from './user';


// Update your existing Project interface
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
  teamMembers: TeamMember[]; // Changed from team: string[]
  color: string;
  milestones?: Milestone[];
  dependencies?: string[];
  projectManager?: string; // userId
  client?: {
    name: string;
    email: string;
    phone?: string;
    company: string;
  };
}

// Update your existing Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  assigneeId: string; // Changed from assignee: string
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  dependencies?: string[];
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  watchers?: string[]; // userIds who get notifications
}

// Add new StorageConfig interface
export interface StorageConfig {
  type: 'local' | 'supabase';
  supabaseUrl?: string;
  supabaseKey?: string;
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