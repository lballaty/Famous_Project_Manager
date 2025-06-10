// src/types/user.ts - Enhanced user management types
export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  role: 'admin' | 'project_manager' | 'team_lead' | 'developer' | 'designer' | 'analyst' | 'stakeholder';
  skills?: string[];
  location?: string;
  timezone?: string;
  joinedDate: string;
  lastActive?: string;
  workCapacity?: number; // hours per week
  hourlyRate?: number;
  preferredContactMethod?: 'email' | 'phone' | 'slack' | 'teams';
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
}

export interface TeamMember {
  userId: string;
  projectId: string;
  role: 'lead' | 'developer' | 'designer' | 'analyst' | 'qa' | 'devops' | 'stakeholder';
  joinedDate: string;
  allocation: number; // percentage of time allocated to project
  permissions: ProjectPermission[];
  isActive: boolean;
}

export interface ProjectPermission {
  action: 'view' | 'edit' | 'delete' | 'manage_team' | 'manage_tasks' | 'manage_milestones' | 'view_reports';
  granted: boolean;
}

export interface UserStats {
  tasksAssigned: number;
  tasksCompleted: number;
  projectsActive: number;
  hoursWorked: number;
  completionRate: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: 'created_task' | 'completed_task' | 'updated_project' | 'joined_project' | 'commented' | 'uploaded_file';
  description: string;
  timestamp: string;
  projectId?: string;
  taskId?: string;
}