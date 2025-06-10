// src/utils/dataImport.ts - Updated with user management
import { Project, Task, Milestone } from '../types/project';
import { User } from '../types/user';
import { seedData, generateMoreProjects } from '../data/seedData';

export interface ImportOptions {
  mode: 'replace' | 'merge';
  includeProjects: boolean;
  includeTasks: boolean;
  includeMilestones: boolean;
  includeUsers: boolean;
}

export interface ImportResult {
  success: boolean;
  message: string;
  projectsAdded: number;
  tasksAdded: number;
  milestonesAdded: number;
  usersAdded: number;
  errors: string[];
}

// Validate data structure
export const validateImportData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format');
    return { valid: false, errors };
  }

  // Validate projects
  if (data.projects && Array.isArray(data.projects)) {
    data.projects.forEach((project: any, index: number) => {
      if (!project.id || !project.name) {
        errors.push(`Project at index ${index} missing required fields (id, name)`);
      }
      if (project.status && !['planning', 'in-progress', 'completed', 'on-hold'].includes(project.status)) {
        errors.push(`Project "${project.name}" has invalid status`);
      }
      if (project.priority && !['low', 'medium', 'high'].includes(project.priority)) {
        errors.push(`Project "${project.name}" has invalid priority`);
      }
    });
  }

  // Validate tasks
  if (data.tasks && Array.isArray(data.tasks)) {
    data.tasks.forEach((task: any, index: number) => {
      if (!task.id || !task.title || !task.projectId) {
        errors.push(`Task at index ${index} missing required fields (id, title, projectId)`);
      }
      if (task.status && !['todo', 'in-progress', 'completed'].includes(task.status)) {
        errors.push(`Task "${task.title}" has invalid status`);
      }
    });
  }

  // Validate users
  if (data.users && Array.isArray(data.users)) {
    data.users.forEach((user: any, index: number) => {
      if (!user.id || !user.email || !user.firstName || !user.lastName) {
        errors.push(`User at index ${index} missing required fields (id, email, firstName, lastName)`);
      }
      if (user.role && !['admin', 'project_manager', 'team_lead', 'developer', 'designer', 'analyst', 'stakeholder'].includes(user.role)) {
        errors.push(`User "${user.name || user.email}" has invalid role`);
      }
      if (user.status && !['active', 'inactive', 'pending'].includes(user.status)) {
        errors.push(`User "${user.name || user.email}" has invalid status`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
};

// Import seed data
export const importSeedData = (
  currentProjects: Project[],
  currentUsers: User[],
  options: ImportOptions,
  setProjects: (projects: Project[]) => void,
  setUsers: (users: User[]) => void
): ImportResult => {
  try {
    let newProjects: Project[] = [];
    let newUsers: User[] = [];
    
    if (options.mode === 'replace') {
      newProjects = [...seedData.projects];
      newUsers = [...seedData.users];
    } else {
      // Merge mode - add seed data to existing
      const existingProjectIds = new Set(currentProjects.map(p => p.id));
      const existingUserIds = new Set(currentUsers.map(u => u.id));
      
      const newSeedProjects = seedData.projects.filter(p => !existingProjectIds.has(p.id));
      const newSeedUsers = seedData.users.filter(u => !existingUserIds.has(u.id));
      
      newProjects = [...currentProjects, ...newSeedProjects];
      newUsers = [...currentUsers, ...newSeedUsers];
    }

    setProjects(newProjects);
    setUsers(newUsers);

    return {
      success: true,
      message: `Successfully imported ${seedData.projects.length} projects and ${seedData.users.length} users with sample data`,
      projectsAdded: seedData.projects.length,
      tasksAdded: seedData.tasks.length,
      milestonesAdded: seedData.milestones.length,
      usersAdded: seedData.users.length,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to import seed data',
      projectsAdded: 0,
      tasksAdded: 0,
      milestonesAdded: 0,
      usersAdded: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

// Import JSON data
export const importJsonData = (
  jsonData: any,
  currentProjects: Project[],
  currentUsers: User[],
  options: ImportOptions,
  setProjects: (projects: Project[]) => void,
  setUsers: (users: User[]) => void
): ImportResult => {
  const validation = validateImportData(jsonData);
  
  if (!validation.valid) {
    return {
      success: false,
      message: 'Data validation failed',
      projectsAdded: 0,
      tasksAdded: 0,
      milestonesAdded: 0,
      usersAdded: 0,
      errors: validation.errors
    };
  }

  try {
    let newProjects: Project[] = [];
    let newUsers: User[] = [];
    
    if (options.mode === 'replace') {
      newProjects = jsonData.projects || [];
      newUsers = jsonData.users || [];
    } else {
      // Merge mode
      const existingProjectIds = new Set(currentProjects.map(p => p.id));
      const existingUserIds = new Set(currentUsers.map(u => u.id));
      
      const importedProjects = (jsonData.projects || []).filter((p: Project) => !existingProjectIds.has(p.id));
      const importedUsers = (jsonData.users || []).filter((u: User) => !existingUserIds.has(u.id));
      
      newProjects = [...currentProjects, ...importedProjects];
      newUsers = [...currentUsers, ...importedUsers];
    }

    setProjects(newProjects);
    setUsers(newUsers);

    return {
      success: true,
      message: `Successfully imported ${(jsonData.projects || []).length} projects and ${(jsonData.users || []).length} users`,
      projectsAdded: (jsonData.projects || []).length,
      tasksAdded: (jsonData.tasks || []).length,
      milestonesAdded: (jsonData.milestones || []).length,
      usersAdded: (jsonData.users || []).length,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to import JSON data',
      projectsAdded: 0,
      tasksAdded: 0,
      milestonesAdded: 0,
      usersAdded: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

// Export current data (updated to include users)
export const exportData = (projects: Project[], users: User[]) => {
  const allTasks: Task[] = projects.flatMap(p => p.tasks || []);
  const allMilestones: Milestone[] = projects.flatMap(p => p.milestones || []);
  const allTeamMembers = projects.flatMap(p => p.teamMembers || []);
  
  const exportData = {
    projects,
    tasks: allTasks,
    milestones: allMilestones,
    users,
    teamMembers: allTeamMembers,
    exportDate: new Date().toISOString(),
    version: '2.0'
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `project-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate additional sample projects (updated to include team assignments)
export const addMoreSampleProjects = (
  currentProjects: Project[],
  currentUsers: User[],
  count: number,
  setProjects: (projects: Project[]) => void
): ImportResult => {
  try {
    const newProjects = generateMoreProjects(count);
    
    // If we have users, assign them to the generated projects
    if (currentUsers.length > 0) {
      newProjects.forEach(project => {
        // Assign random users to each project
        const availableUsers = currentUsers.filter(u => u.status === 'active');
        const teamSize = Math.min(Math.floor(Math.random() * 5) + 2, availableUsers.length);
        const selectedUsers = availableUsers
          .sort(() => Math.random() - 0.5)
          .slice(0, teamSize);
        
        project.teamMembers = selectedUsers.map(user => ({
          userId: user.id,
          projectId: project.id,
          role: ['developer', 'designer', 'analyst'][Math.floor(Math.random() * 3)] as any,
          joinedDate: new Date().toISOString(),
          allocation: Math.floor(Math.random() * 60) + 20,
          permissions: [],
          isActive: true
        }));
        
        // Assign a project manager
        if (selectedUsers.length > 0) {
          project.projectManager = selectedUsers[0].id;
        }
      });
    }
    
    const updatedProjects = [...currentProjects, ...newProjects];
    setProjects(updatedProjects);

    return {
      success: true,
      message: `Successfully generated ${count} additional sample projects`,
      projectsAdded: count,
      tasksAdded: 0,
      milestonesAdded: 0,
      usersAdded: 0,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to generate sample projects',
      projectsAdded: 0,
      tasksAdded: 0,
      milestonesAdded: 0,
      usersAdded: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};