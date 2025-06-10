// src/utils/dataImport.ts
import { Project, Task, Milestone, User } from '../types/project';
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

  return { valid: errors.length === 0, errors };
};

// Import seed data
export const importSeedData = (
  currentProjects: Project[],
  options: ImportOptions,
  setProjects: (projects: Project[]) => void
): ImportResult => {
  try {
    let newProjects: Project[] = [];
    
    if (options.mode === 'replace') {
      newProjects = [...seedData.projects];
    } else {
      // Merge mode - add seed data to existing
      const existingIds = new Set(currentProjects.map(p => p.id));
      const newSeedProjects = seedData.projects.filter(p => !existingIds.has(p.id));
      newProjects = [...currentProjects, ...newSeedProjects];
    }

    setProjects(newProjects);

    return {
      success: true,
      message: `Successfully imported ${seedData.projects.length} projects with sample data`,
      projectsAdded: seedData.projects.length,
      tasksAdded: seedData.tasks.length,
      milestonesAdded: seedData.milestones.length,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to import seed data',
      projectsAdded: 0,
      tasksAdded: 0,
      milestonesAdded: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

// Import JSON data
export const importJsonData = (
  jsonData: any,
  currentProjects: Project[],
  options: ImportOptions,
  setProjects: (projects: Project[]) => void
): ImportResult => {
  const validation = validateImportData(jsonData);
  
  if (!validation.valid) {
    return {
      success: false,
      message: 'Data validation failed',
      projectsAdded: 0,
      tasksAdded: 0,
      milestonesAdded: 0,
      errors: validation.errors
    };
  }

  try {
    let newProjects: Project[] = [];
    
    if (options.mode === 'replace') {
      newProjects = jsonData.projects || [];
    } else {
      // Merge mode
      const existingIds = new Set(currentProjects.map(p => p.id));
      const importedProjects = (jsonData.projects || []).filter((p: Project) => !existingIds.has(p.id));
      newProjects = [...currentProjects, ...importedProjects];
    }

    setProjects(newProjects);

    return {
      success: true,
      message: `Successfully imported ${(jsonData.projects || []).length} projects`,
      projectsAdded: (jsonData.projects || []).length,
      tasksAdded: (jsonData.tasks || []).length,
      milestonesAdded: (jsonData.milestones || []).length,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to import JSON data',
      projectsAdded: 0,
      tasksAdded: 0,
      milestonesAdded: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

// Generate additional sample projects
export const addMoreSampleProjects = (
  currentProjects: Project[],
  count: number,
  setProjects: (projects: Project[]) => void
): ImportResult => {
  try {
    const newProjects = generateMoreProjects(count);
    const updatedProjects = [...currentProjects, ...newProjects];
    setProjects(updatedProjects);

    return {
      success: true,
      message: `Successfully generated ${count} additional sample projects`,
      projectsAdded: count,
      tasksAdded: 0,
      milestonesAdded: 0,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to generate sample projects',
      projectsAdded: 0,
      tasksAdded: 0,
      milestonesAdded: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};
