// src/lib/supabase.ts - Enhanced with lock management and better error handling
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, Task, Milestone } from '../types/project';
import { User, TeamMember } from '../types/user';
import { ProjectLock } from '../types/sync';

// Enhanced Database types that match your Supabase schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          job_title: string | null;
          department: string | null;
          avatar_url: string | null;
          status: 'active' | 'inactive' | 'pending';
          role: 'admin' | 'project_manager' | 'team_lead' | 'developer' | 'designer' | 'analyst' | 'stakeholder';
          skills: string[] | null;
          location: string | null;
          timezone: string | null;
          joined_date: string;
          last_active: string;
          work_capacity: number;
          hourly_rate: number | null;
          preferred_contact_method: 'email' | 'phone' | 'slack' | 'teams' | null;
          social_links: any;
          emergency_contact: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          job_title?: string | null;
          department?: string | null;
          avatar_url?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          role?: 'admin' | 'project_manager' | 'team_lead' | 'developer' | 'designer' | 'analyst' | 'stakeholder';
          skills?: string[] | null;
          location?: string | null;
          timezone?: string | null;
          joined_date?: string;
          last_active?: string;
          work_capacity?: number;
          hourly_rate?: number | null;
          preferred_contact_method?: 'email' | 'phone' | 'slack' | 'teams' | null;
          social_links?: any;
          emergency_contact?: any;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          job_title?: string | null;
          department?: string | null;
          avatar_url?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          role?: 'admin' | 'project_manager' | 'team_lead' | 'developer' | 'designer' | 'analyst' | 'stakeholder';
          skills?: string[] | null;
          location?: string | null;
          timezone?: string | null;
          joined_date?: string;
          last_active?: string;
          work_capacity?: number;
          hourly_rate?: number | null;
          preferred_contact_method?: 'email' | 'phone' | 'slack' | 'teams' | null;
          social_links?: any;
          emergency_contact?: any;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
          priority: 'low' | 'medium' | 'high';
          start_date: string;
          end_date: string;
          progress: number;
          color: string;
          project_manager_id: string | null;
          client: any;
          dependencies: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: 'planning' | 'in-progress' | 'completed' | 'on-hold';
          priority?: 'low' | 'medium' | 'high';
          start_date: string;
          end_date: string;
          progress?: number;
          color?: string;
          project_manager_id?: string | null;
          client?: any;
          dependencies?: string[] | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: 'planning' | 'in-progress' | 'completed' | 'on-hold';
          priority?: 'low' | 'medium' | 'high';
          start_date?: string;
          end_date?: string;
          progress?: number;
          color?: string;
          project_manager_id?: string | null;
          client?: any;
          dependencies?: string[] | null;
        };
      };
      // NEW: Add project_locks table
      project_locks: {
        Row: {
          id: string;
          project_id: string;
          locked_by_user_id: string;
          locked_by_email: string;
          locked_by_name: string;
          locked_at: string;
          expires_at: string;
          lock_reason: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          locked_by_user_id: string;
          locked_by_email: string;
          locked_by_name: string;
          locked_at?: string;
          expires_at: string;
          lock_reason?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          project_id?: string;
          locked_by_user_id?: string;
          locked_by_email?: string;
          locked_by_name?: string;
          locked_at?: string;
          expires_at?: string;
          lock_reason?: string | null;
          is_active?: boolean;
        };
      };
      // Add other tables as needed (tasks, team_members, milestones)...
    };
    Functions: {
      cleanup_expired_locks: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
      extend_project_lock: {
        Args: {
          p_project_id: string;
          p_user_id: string;
          p_additional_minutes?: number;
        };
        Returns: boolean;
      };
    };
  };
}

// Create Supabase client (keep your existing function)
export const createSupabaseClient = (url: string, key: string): SupabaseClient<Database> => {
  return createClient<Database>(url, key);
};

// Enhanced Supabase service class
export class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor(url: string, key: string) {
    this.supabase = createSupabaseClient(url, key);
  }

  // Keep all your existing USER OPERATIONS exactly as they are
  async getUsers(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map(this.transformUserFromDB);
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const dbUser = this.transformUserToDB(user);
    
    const { data, error } = await this.supabase
      .from('users')
      .insert(dbUser)
      .select()
      .single();

    if (error) throw error;

    return this.transformUserFromDB(data);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const dbUpdates = this.transformUserToDB(updates);
    
    const { data, error } = await this.supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.transformUserFromDB(data);
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Keep all your existing PROJECT OPERATIONS exactly as they are
  async getProjects(): Promise<Project[]> {
    const { data: projects, error: projectsError } = await this.supabase
      .from('projects')
      .select(`
        *,
        team_members(*),
        tasks(*),
        milestones(*)
      `);

    if (projectsError) throw projectsError;

    return projects.map(this.transformProjectFromDB);
  }

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const dbProject = this.transformProjectToDB(project);
    
    const { data, error } = await this.supabase
      .from('projects')
      .insert(dbProject)
      .select()
      .single();

    if (error) throw error;

    return this.getProjectById(data.id);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const dbUpdates = this.transformProjectToDB(updates);
    
    const { data, error } = await this.supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private async getProjectById(id: string): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        team_members(*),
        tasks(*),
        milestones(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return this.transformProjectFromDB(data);
  }

  // NEW: PROJECT LOCK OPERATIONS
  async getProjectLocks(): Promise<ProjectLock[]> {
    const { data, error } = await this.supabase
      .from('project_locks')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('locked_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(this.transformLockFromDB);
  }

  async createProjectLock(lock: Omit<ProjectLock, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectLock> {
    const { data, error } = await this.supabase
      .from('project_locks')
      .insert({
        project_id: lock.project_id,
        locked_by_user_id: lock.locked_by_user_id,
        locked_by_email: lock.locked_by_email,
        locked_by_name: lock.locked_by_name,
        expires_at: lock.expires_at,
        lock_reason: lock.lock_reason,
        is_active: lock.is_active
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return this.transformLockFromDB(data);
  }

  async updateProjectLock(lockId: string, updates: Partial<ProjectLock>): Promise<ProjectLock> {
    const { data, error } = await this.supabase
      .from('project_locks')
      .update({
        expires_at: updates.expires_at,
        lock_reason: updates.lock_reason,
        is_active: updates.is_active
      })
      .eq('id', lockId)
      .select()
      .single();
      
    if (error) throw error;
    
    return this.transformLockFromDB(data);
  }

  async unlockProject(projectId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('project_locks')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .eq('locked_by_user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
  }

  async extendProjectLock(projectId: string, userId: string, additionalMinutes: number = 60): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('extend_project_lock', {
      p_project_id: projectId,
      p_user_id: userId,
      p_additional_minutes: additionalMinutes
    });

    if (error) throw error;
    return data;
  }

  async cleanupExpiredLocks(): Promise<void> {
    const { error } = await this.supabase.rpc('cleanup_expired_locks');
    if (error) throw error;
  }

  // Keep all your existing TRANSFORMATION METHODS exactly as they are
  private transformUserFromDB(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      phone: dbUser.phone,
      jobTitle: dbUser.job_title,
      department: dbUser.department,
      avatar: dbUser.avatar_url,
      status: dbUser.status,
      role: dbUser.role,
      skills: dbUser.skills,
      location: dbUser.location,
      timezone: dbUser.timezone,
      joinedDate: dbUser.joined_date,
      lastActive: dbUser.last_active,
      workCapacity: dbUser.work_capacity,
      hourlyRate: dbUser.hourly_rate,
      preferredContactMethod: dbUser.preferred_contact_method,
      socialLinks: dbUser.social_links,
      emergencyContact: dbUser.emergency_contact
    };
  }

  private transformUserToDB(user: Partial<User>): any {
    const dbUser: any = {};
    
    if (user.email) dbUser.email = user.email;
    if (user.name) dbUser.name = user.name;
    if (user.firstName) dbUser.first_name = user.firstName;
    if (user.lastName) dbUser.last_name = user.lastName;
    if (user.phone !== undefined) dbUser.phone = user.phone;
    if (user.jobTitle !== undefined) dbUser.job_title = user.jobTitle;
    if (user.department !== undefined) dbUser.department = user.department;
    if (user.avatar !== undefined) dbUser.avatar_url = user.avatar;
    if (user.status) dbUser.status = user.status;
    if (user.role) dbUser.role = user.role;
    if (user.skills !== undefined) dbUser.skills = user.skills;
    if (user.location !== undefined) dbUser.location = user.location;
    if (user.timezone !== undefined) dbUser.timezone = user.timezone;
    if (user.joinedDate) dbUser.joined_date = user.joinedDate;
    if (user.lastActive) dbUser.last_active = user.lastActive;
    if (user.workCapacity !== undefined) dbUser.work_capacity = user.workCapacity;
    if (user.hourlyRate !== undefined) dbUser.hourly_rate = user.hourlyRate;
    if (user.preferredContactMethod !== undefined) dbUser.preferred_contact_method = user.preferredContactMethod;
    if (user.socialLinks !== undefined) dbUser.social_links = user.socialLinks;
    if (user.emergencyContact !== undefined) dbUser.emergency_contact = user.emergencyContact;
    
    return dbUser;
  }

  private transformProjectFromDB(dbProject: any): Project {
    return {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description,
      status: dbProject.status,
      priority: dbProject.priority,
      startDate: dbProject.start_date,
      endDate: dbProject.end_date,
      progress: dbProject.progress,
      color: dbProject.color,
      projectManager: dbProject.project_manager_id,
      client: dbProject.client,
      dependencies: dbProject.dependencies || [],
      teamMembers: (dbProject.team_members || []).map((tm: any) => ({
        userId: tm.user_id,
        projectId: tm.project_id,
        role: tm.role,
        joinedDate: tm.joined_date,
        allocation: tm.allocation,
        permissions: tm.permissions || [],
        isActive: tm.is_active
      })),
      tasks: (dbProject.tasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        assigneeId: task.assignee_id,
        dueDate: task.due_date,
        priority: task.priority,
        projectId: task.project_id,
        dependencies: task.dependencies || [],
        estimatedHours: task.estimated_hours,
        actualHours: task.actual_hours,
        tags: task.tags || [],
        watchers: task.watchers || []
      })),
      milestones: (dbProject.milestones || []).map((milestone: any) => ({
        id: milestone.id,
        title: milestone.title,
        date: milestone.date,
        completed: milestone.completed,
        projectId: milestone.project_id
      }))
    };
  }

  private transformProjectToDB(project: Partial<Project>): any {
    const dbProject: any = {};
    
    if (project.name) dbProject.name = project.name;
    if (project.description !== undefined) dbProject.description = project.description;
    if (project.status) dbProject.status = project.status;
    if (project.priority) dbProject.priority = project.priority;
    if (project.startDate) dbProject.start_date = project.startDate;
    if (project.endDate) dbProject.end_date = project.endDate;
    if (project.progress !== undefined) dbProject.progress = project.progress;
    if (project.color) dbProject.color = project.color;
    if (project.projectManager !== undefined) dbProject.project_manager_id = project.projectManager;
    if (project.client !== undefined) dbProject.client = project.client;
    if (project.dependencies !== undefined) dbProject.dependencies = project.dependencies;
    
    return dbProject;
  }

  // NEW: Transform lock data
  private transformLockFromDB(dbLock: any): ProjectLock {
    return {
      id: dbLock.id,
      project_id: dbLock.project_id,
      locked_by_user_id: dbLock.locked_by_user_id,
      locked_by_email: dbLock.locked_by_email,
      locked_by_name: dbLock.locked_by_name,
      locked_at: dbLock.locked_at,
      expires_at: dbLock.expires_at,
      lock_reason: dbLock.lock_reason,
      is_active: dbLock.is_active
    };
  }
}